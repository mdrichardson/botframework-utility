/* eslint-disable @typescript-eslint/no-parameter-properties */
'use strict';

import { hook, Instrumenter, Reporter } from 'istanbul';
import Mocha = require('mocha');
import remapIstanbul = require('remap-istanbul');
import decache from 'decache';
import * as fs from 'fs';
import * as glob from 'glob';
import * as paths from 'path';

let mocha = new Mocha({
    ui: "tdd",
});
mocha.useColors(true);
mocha.slow(10000);

function _mkDirIfExists(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function _readCoverOptions(testsRoot: string): TestRunnerOptions {
    let coverConfigPath = paths.join(testsRoot, '..', '..', 'coverconfig.json');
    let coverConfig!: TestRunnerOptions;
    if (fs.existsSync(coverConfigPath)) {
        let configContent = fs.readFileSync(coverConfigPath, 'utf-8');
        coverConfig = JSON.parse(configContent);
    } else { throw new Error('coverconfig.json not found'); };
    return coverConfig;
}

export function configure(mochaOpts): void {
    mocha = new Mocha(mochaOpts);
}

export function run(testsRoot, clb): any {
    console.log(`\n#################### RUNNING TESTS WITH COVERAGE ####################`);
    // Enable source map support
    require('source-map-support').install();

    // Read configuration for the coverage file
    let coverOptions: TestRunnerOptions = _readCoverOptions(testsRoot);
    let coverageRunner;
    if (coverOptions && coverOptions.enabled) {
        // Setup coverage pre-test, including post-test hook to report
        coverageRunner = new CoverageRunner(coverOptions, testsRoot, clb);
        coverageRunner.setupCoverage();
    }

    // Glob test files
    glob('**/**.test.js', { cwd: testsRoot }, (error, files): any => {
        if (error) {
            return clb(error);
        }
        try {
            // Fill into Mocha
            files.forEach((f): Mocha => {
                return mocha.addFile(paths.join(testsRoot, f));
            });
            // Run the tests
            let failureCount = 0;

            mocha.run()
                .on('fail', (test, err): void => {
                    failureCount++;
                })
                .on('end', (): void => {
                    console.log(`\n#################### COVERAGE TESTS COMPLETE ####################`);
                    if (coverageRunner) {
                        coverageRunner.reportCoverage();
                    }
                    clb(undefined, failureCount);
                });
        } catch (error) {
            return clb(error);
        }
    });
}

export interface TestRunnerOptions {
    enabled?: boolean;
    relativeCoverageDir: string;
    relativeSourcePath: string;
    ignorePatterns: string[];
    includePid?: boolean;
    reports?: string[];
    verbose?: boolean;
}

class CoverageRunner {
    private coverageVar: string = '$$cov_' + new Date().getTime() + '$$';
    private transformer: any = undefined;
    private matchFn: any = undefined;
    private instrumenter: any = undefined;

    public constructor(private options: TestRunnerOptions, private testsRoot: string, private endRunCallback: any) {
        if (!options.relativeSourcePath) {
            return endRunCallback('Error - relativeSourcePath must be defined for code coverage to work');
        }
    }

    public setupCoverage(): void {
        // Set up Code Coverage, hooking require so that instrumented code is returned
        let self = this;
        self.instrumenter = new Instrumenter({ coverageVariable: self.coverageVar });
        let sourceRoot = paths.join(self.testsRoot, self.options.relativeSourcePath);

        // Glob source files
        let srcFiles = glob.sync('**/**.js', {
            cwd: sourceRoot,
            ignore: self.options.ignorePatterns,
        });

        // Create a match function - taken from the run-with-cover.js in istanbul.
        let fileMap = {};
        srcFiles.forEach((file): void => {
            let fullPath = paths.join(sourceRoot, file);
            fileMap[fullPath] = true;

            // On Windows, extension is loaded pre-test hooks and this mean we lose
            // our chance to hook the Require call. In order to instrument the code
            // we have to decache the JS file so on next load it gets instrumented.
            // This doesn't impact tests, but is a concern if we had some integration
            // tests that relied on VSCode accessing our module since there could be
            // some shared global state that we lose.
            decache(fullPath);
        });

        self.matchFn = (file): boolean => { return fileMap[file]; };
        self.matchFn.files = Object.keys(fileMap);

        // Hook up to the Require function so that when this is called, if any of our source files
        // are required, the instrumented version is pulled in instead. These instrumented versions
        // write to a global coverage variable with hit counts whenever they are accessed
        self.transformer = self.instrumenter.instrumentSync.bind(self.instrumenter);
        let hookOpts = { extensions: ['.js'], verbose: false };
        hook.hookRequire(self.matchFn, self.transformer, hookOpts);

        // initialize the global variable to stop mocha from complaining about leaks
        global[self.coverageVar] = {};

        // Hook the process exit event to handle reporting
        // Only report coverage if the process is exiting successfully
        process.on('exit', async (): Promise<void> => {
            await self.reportCoverage();
            console.log('DONE');
        });
    }

    /**
     * Writes a coverage report. Note that as this is called in the process exit callback, all calls must be synchronous.
     *
     * @returns {void}
     *
     * @memberOf CoverageRunner
     */
    public async reportCoverage(): Promise<void> {
        let self = this;
        hook.unhookRequire();
        let cov: any;
        if (typeof global[self.coverageVar] === 'undefined' || Object.keys(global[self.coverageVar]).length === 0) {
            console.error('No coverage information was collected, exit without writing coverage information');
            return;
        } else {
            cov = global[self.coverageVar];
        }

        // TODO consider putting this under a conditional flag
        // Files that are not touched by code ran by the test runner is manually instrumented, to
        // illustrate the missing coverage.
        self.matchFn.files.forEach((file): void => {
            if (!cov[file]) {
                self.transformer(fs.readFileSync(file, 'utf-8'), file);

                // When instrumenting the code, istanbul will give each FunctionDeclaration a value of 1 in coverState.s,
                // presumably to compensate for function hoisting. We need to reset this, as the function was not hoisted,
                // as it was never loaded.
                Object.keys(self.instrumenter.coverState.s).forEach((key): void => {
                    self.instrumenter.coverState.s[key] = 0;
                });

                cov[file] = self.instrumenter.coverState;
            }
        });

        // TODO Allow config of reporting directory with
        let reportingDir = paths.join(self.testsRoot, self.options.relativeCoverageDir);
        let includePid = self.options.includePid;
        let pidExt = includePid ? ('-' + process.pid) : '';
        let coverageFile = paths.resolve(reportingDir, 'coverage' + pidExt + '.json');

        _mkDirIfExists(reportingDir); // yes, do this again since some test runners could clean the dir initially created

        fs.writeFileSync(coverageFile, JSON.stringify(cov), 'utf8');

        let remappedCollector = remapIstanbul.remap(cov, {warn: (warning): void => {
            // We expect some warnings as any JS file without a typescript mapping will cause this.
            // By default, we'll skip printing these to the console as it clutters it up
            if (self.options.verbose) {
                console.warn(warning);
            }
        }});

        let reporter = new Reporter(undefined, reportingDir);
        let reportTypes = (self.options.reports instanceof Array) ? self.options.reports : ['lcov'];
        reporter.addAll(reportTypes);
        reporter.write(remappedCollector, true, (): void => {
            console.log(`Reports written to ${ reportingDir }`);
        });
    }
}