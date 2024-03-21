import * as log4js from "log4js";
import AntPathMatcher from "../../src/match/AntPathMatcher";
import SimplePathMatcher from "../../src/match/SimplePathMatcher";


const logger = log4js.getLogger();
logger.level = 'debug';

describe("test path match", () => {


    test("ant path matcher", () => {
        const antPathMatcher = new AntPathMatcher();

        expect(antPathMatcher.match("/demo/*.tsx", "/demo/a.tsx")).toEqual(true);
        expect(antPathMatcher.match("/demo/*.tsx", "/demo/b/a.tsx")).toEqual(false);
        expect(antPathMatcher.match("/demo/*.tsx", "/demo/b/a.tsx")).toEqual(false);
        expect(antPathMatcher.match("/src/pages/**/*.less", "/src/pages/demo/style.less")).toEqual(true);

        function match(pattern, paths: string[]) {
            return paths.map((path) => {
                return antPathMatcher.match(pattern, path)
            })
        }

        expect(match('/path/**/?z', ['/path/x/y/z/xyz', '/path/x/y/z/xyy'])).toEqual([false, false])
        expect(match('/path/**/*z', ['/path/x/y/z/xyz', '/path/x/y/z/xyy'])).toEqual([true, false])
        expect(match('/foo/{id}/bar', ['/foo/1/bar', '/foo/ss/bar', '/foo/1/2/bar'])).toEqual([true, true, false])
        expect(match('/app/*.x', ['/app/a.x', '/app/a.b'])).toEqual([true, false])
        expect(match('/app/p?ttern', ['/app/pXttern', '/app/pattern', '/app/pttern'])).toEqual([true, true, false])
        expect(match('/**/example', ['/app/example', '/app/foo/example', '/example', '/app/foo/example1'])).toEqual([true, true, true, false])
        expect(match('/app/**/dir/file.', ['/app/dir/file.jsp', '/app/foo/dir/file.html'])).toEqual([false, false])
        expect(match('/**/*.jsp', ['/app/dir/file.jsp', '/app/foo/dir/file.html'])).toEqual([true, false])
        expect(match('/app/**', ['/app/dir/file', '/app/foo/dir/file.html'])).toEqual([true, true])
        expect(match('/api/**/user/refreshToken', ['/api/1.0.0/user/refreshToken', '/abc/path1/hhh', '/abc/path'])).toEqual([true, false, false])
        expect(match('/api/**/user/authCode', ['/api/1.0.0/user/authCode', '/abc/path1/hhh', '/abc/path'])).toEqual([true, false, false])

    });

    test("simple path matcher", () => {
        const pathMatcher = new SimplePathMatcher();

        function match(pattern, paths: string[]) {
            return paths.map((path) => {
                return pathMatcher.match(pattern, path)
            })
        }

        expect(match('/path/**', ['http://abc.d/path/x/y/z/xyz', '/paths/x/y/z/xyy'])).toEqual([true, false])
        expect(match('/**/path', ['http://abc.d/abc/path', '/abc/path1', '/abc/path/2'])).toEqual([true, false, false])
        expect(match('/**/path/**', ['http://abc.d/abc/path/test', '/abc/path1/hhh', '/abc/path'])).toEqual([true, false, false])
        expect(match('/api/**/user/refreshToken', ['http://abc.d/api/1.0.0/user/refreshToken', '/abc/path1/hhh', '/abc/path'])).toEqual([true, false, false])
        // http://117.50.43.50:52001/app/v1.0/user/login /app/**/user/login
        expect(match('/app/**/user/login', ['http://xx.xx:52001/app/v1.0/user/login', 'http://abc.d/app/1.0.0/user/login', '/abc/path1/hhh', '/abc/path'])).toEqual([true, true, false, false])
        expect(match('/app/**/user/authCode', ['http://xx.xx:52001/app/v1.0/user/authCode', 'http://abc.d/app/1.0.0/user/login', '/abc/path1/hhh', '/abc/path'])).toEqual([true, false, false, false])
    })

    test("simple path matcher 2", () => {
        const pathMatcher = new SimplePathMatcher();

        function match(pattern, paths: string[]) {
            return paths.map((path) => {
                return pathMatcher.match(pattern, path)
            })
        }

        const paths = [
            "/白色/联通/4G/64",
            "/白色/移动/4G/64",
            "/白色/电信/4G/64",
            "/白色/联通/5G/32",
            "/白色/移动/5G/32",
            "/白色/电信/5G/32",

            "/金色/联通/4G/64",
            "/金色/移动/4G/64",
            "/金色/电信/4G/64",
            "/金色/联通/5G/32",
            "/金色/移动/5G/32",
            "/金色/电信/5G/32",

            "/银白色/联通/4G/64",
            "/银白色/移动/4G/64",
            "/银白色/电信/4G/64",
            "/银白色/联通/5G/32",
            "/银白色/移动/5G/32",
            "/银白色/电信/5G/32",
        ];
        expect(match('/白色/**', paths)).toEqual([true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false,]);
        expect(match('/银白色/**', paths)).toEqual([false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true]);
    })
});

