import ApiRequester from "../src/api/clients/ApiRequester";
import Url from "url";
import EnterpriseBrowserApiRequester from "../src/browser/EnterpriseBrowserApiRequester";
import {DocumentDownloader} from "../src/browser/DocumentDownloader";

describe("test yuque api", () => {

    const api: ApiRequester = new ApiRequester("UABKub4Xy6CPe2Pdgrwq12z2YyCBQHRrLo9rPnO8", "captekefu");

    const browserApiRequester: EnterpriseBrowserApiRequester = new EnterpriseBrowserApiRequester({
        "Cookie": "aliyungf_tc=32ab054ae6553effc187797f429e870cb9256f2ddd400232c570a0abc2b2961c; yuque_ctoken=1UZMyNA-kHTwwvi-KdGpVv0X; receive-cookie-deprecation=1; lang=zh-cn; _yuque_session=kC4Wtyjde9lU30Bjjd_G1fsjIIaNFI6iKicYAvg4AFu-YKGawAdRXwH-tlJLfny5QpS2boWXdH2Mvw9CSpfKiQ==; _uab_collina=171920564029497795555318; tfstk=f2NKiUg3rNLdu9XuOy6grFSqRsQGiWUE6kzXZ0mHFlETVunkZwrHwLUmjevnK2A8BuZZKDZot3C8XXMzK0mn2bUzDNjcis4U8bk5mif0kkESPXgIR2G5PAgqlzBjojzU8b8ZcW6aoyJ88FzRJbZS1Ag-PbTIdui11curPHgWONUsb4GSRQ9B1VgqoHtSRfp1AcYSWQe-MOnRRLupNQNCavnA-cgZW5LEdm4Q9QO7l2HKcyiOmdboyYEKp5fp02e_kk0L4sREOYeQhXNRD6h_uRqIWusvecwYT7H09ipqAWozDXwOfBhSt-NxNbBv8VVL5Sk8TMdsvlz_nXPfbQEbSrVEQ7Ivf0ynufgLBa9sAYsPQSVxsWxmD4vCWNpyUvggnBJ0IdJsdIgtmw1pULkSuVncWTpyUviKWmbKeLJrQKf..; current_theme=default; receive-cookie-deprecation=1; acw_tc=ac11000117206054290743863ebeb9d16dedd8837fbc9e6f4cb0aaf3a7d7fb",
        "X-Csrf-Token": "1UZMyNA-kHTwwvi-KdGpVv0X"
    }, "captekefu")

    test("test get repo", async () => {
        // const result = await api.getTeamDetails("mspq9a");
        const result1 = await api.getRepos("mspq9a");
        // console.log(result1);
        const result2 = await api.getRepoDetails(result1[0].namespace)
        // console.log(result2);
        const result3 = await api.getRepoDocTree(result1[0].namespace)
        // console.log(result3);
        const docs = result3[4];
        const result4 = await api.getRepoDocDetails(result1[0].namespace, docs.slug);
        console.log(result4.body_html);
        // const h= await api.hello();
        //  const result = await api.repo("mspq9a/nobe-v2")
        // https://captekefu.yuque.com/api/v2/repos/mspq9a/nobe-v2
        // https://captekefu.yuque.com/api/v2/repos/mspq9a/nobe-v2
        // const result = await yuque.repo('mspq9a/nobe-v2').detail()
        // const result  = await axios.get("https://captekefu.yuque.com/api/v2/repos/mspq9a/nobe-v2",{
        //        headers:{
        //            'X-Auth-Token':"UABKub4Xy6CPe2Pdgrwq12z2YyCBQHRrLo9rPnO8",
        //            'User-Agent': "app-name",
        //        }
        //    }).then(resp=>resp.data)

    })

    test("test browser", async () => {
        // const result1 = await browserApiRequester.getGroupQuickLinks();

        // const result2 = await browserApiRequester.getGroupDetails(result1[0].target.login)
        // const result3 = await browserApiRequester.getGroupBookStacks(result1[0].target.id)
        // const result4 = await browserApiRequester.getBookDocs(result3[0].books[0].id)
        // console.log(result4)

        await new DocumentDownloader({
            cookie: "aliyungf_tc=32ab054ae6553effc187797f429e870cb9256f2ddd400232c570a0abc2b2961c; yuque_ctoken=1UZMyNA-kHTwwvi-KdGpVv0X; receive-cookie-deprecation=1; lang=zh-cn; _yuque_session=kC4Wtyjde9lU30Bjjd_G1fsjIIaNFI6iKicYAvg4AFu-YKGawAdRXwH-tlJLfny5QpS2boWXdH2Mvw9CSpfKiQ==; _uab_collina=171920564029497795555318; tfstk=f2NKiUg3rNLdu9XuOy6grFSqRsQGiWUE6kzXZ0mHFlETVunkZwrHwLUmjevnK2A8BuZZKDZot3C8XXMzK0mn2bUzDNjcis4U8bk5mif0kkESPXgIR2G5PAgqlzBjojzU8b8ZcW6aoyJ88FzRJbZS1Ag-PbTIdui11curPHgWONUsb4GSRQ9B1VgqoHtSRfp1AcYSWQe-MOnRRLupNQNCavnA-cgZW5LEdm4Q9QO7l2HKcyiOmdboyYEKp5fp02e_kk0L4sREOYeQhXNRD6h_uRqIWusvecwYT7H09ipqAWozDXwOfBhSt-NxNbBv8VVL5Sk8TMdsvlz_nXPfbQEbSrVEQ7Ivf0ynufgLBa9sAYsPQSVxsWxmD4vCWNpyUvggnBJ0IdJsdIgtmw1pULkSuVncWTpyUviKWmbKeLJrQKf..; current_theme=default; receive-cookie-deprecation=1; acw_tc=ac11000117206152215442798e8e5661254fc27b27f6dcceffd36b2ec15721",
            csrfToken: "1UZMyNA-kHTwwvi-KdGpVv0X",
            appName: "captekefu"
        }).download()
    })

    test("test repo api", () => {
        // api.getRepos("")
        const result = parseUrl("https://captekefu.yuque.com/mspq9a/nobe-v2")
        console.log("result", result)
    })

    const parseUrl = (url: string): any => {
        const result = Url.parse(url);
        const origin = `${result.protocol}//${result.host}`;
        let pathname = result.pathname;

        if (!pathname) {
            throw Error("解析失败");
        }

        pathname = pathname.replace(/^\//, "");
        const [group, repo, doc] = pathname.split("/");

        return {
            origin,
            slug: doc,
            name: group + "_" + repo,
            url,
            namespace: group + "/" + repo,
        };
    };

})