const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const got = require('got');
const gotResume = require('got-resume');
const _progress = require('cli-progress');
const pipeline = promisify(stream.pipeline);
const filesize = require('filesize');
const path = require('path');
const prettyms = require('pretty-ms');


const defaultMultiBarOpts = {
    // format: ' {bar} | "{filename}" | "{percentage}%" | ETA: {eta}s | {value}/{total}',
    format: (options, params, payload) => {
        const { value, total, eta } = params;
        const { percentage, filename } = payload;
        // console.log('payload', eta);
        const bar = options.barCompleteString.substr(0, Math.round(params.progress * options.barsize));

        return `[ ${bar} ] | "${filename}" | "${percentage}%" | ETA: ${eta == 'NULL' ? 0 : Number.isFinite(eta) ? prettyms(eta * 1000) : 'Unknown'} | ${filesize(value)}/${filesize(total)}`;
    },
    // 02160389313,
    // 13774446668
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    // clearOnComplete: true,
    stopOnComplete: true,
    forceRedraw: true
}

let defaultMultiBarGetter = (function () {
    let defaultMultiBar;
    return () => defaultMultiBar || (defaultMultiBar = new _progress.MultiBar(defaultMultiBarOpts));
})();

async function downloadWithProgress(url, filename, cb, opts = {}) {
    const { writeOpts = {}, gotResumeOpts = {} } = opts;
    // console.log(opts);
    return pipeline(
        gotResume(url, gotResumeOpts).on('progress', progress => {
            // Report download progress
            // console.log('progress=>', progress);
            cb && cb(progress);
        }),
        fs.createWriteStream(filename, writeOpts)
    );
}

async function getFilesize(url) {
    const res = await got(url, { method: 'HEAD' });
    const code = res.statusCode;
    if (code >= 400) {
        return new Error('Received invalid status code: ' + code);
    }

    var len = res.headers['content-length']
    if (!len) {
        return new Error('Unable to determine file size');
    }
    len = +len
    if (len !== len) {
        return new Error('Invalid Content-Length received');
    }

    return +res.headers['content-length'];
}

/**
 * 
 * @param {string} url 
 * @param {filename including filepath, if basedir not exists, it will create automatically } filename 
 * @param { _progress.MultiBar instance } multibar 
 */
async function downloadWithProgressBar(url, filename, multibar = defaultMultiBarGetter()) {
    const writeOpts = {};
    const gotResumeOpts = {};
    let offset = 0;
    let actualTotal = 100;
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    if (fs.existsSync(filename)) {
        writeOpts.flags = 'a';
        const stat = fs.statSync(filename);
        offset = stat.size;


        //get file size
        actualTotal = await getFilesize(url);
        // console.log('file size', total);
    }
    offset > 0 && (gotResumeOpts.offset = offset);


    const bar = multibar.create(actualTotal, offset, { filename, percentage: ((offset / actualTotal) * 100).toFixed(2) });

    if (actualTotal > 0 && actualTotal === offset) {
        // console.log(`File [ ${filename} ] exists and already downloaded`);
        bar.update(actualTotal, { percentage: 100 });
        bar.stop();
    } else {
        // const bar = multibar.create(100, 0, { filename });
        // const bar = multibar.create(total, offset, { filename });
        if (offset > 0) {
            // console.log(`File exists, download from ${(100 * (offset / total).toFixed(2))}%`)
        }
        await downloadWithProgress(url, filename, ({ transferred, total }) => {
            if (total > actualTotal || offset == 0) {
                bar.setTotal(total);
            }
            // console.log('progress=>', transferred, total, percent);
            let actualTransferred = transferred + offset;
            bar.update(actualTransferred, { percentage: ((actualTransferred / bar.getTotal()) * 100).toFixed(2) });
        }, { writeOpts, gotResumeOpts });
    }

    return bar;
}


module.exports = {
    downloadWithProgressBar,
    getFilesize,
    got,
    gotResume,
    defaultMultiBarOpts,
    defaultMultiBarGetter,
    MultiBar: _progress.MultiBar,
    SingleBar: _progress.SingleBar,
    _progress: _progress
}

// (async () => {
//     await pipeline(
//         got.stream('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1280_10MG.mp4').on('downloadProgress', progress => {
//             // Report download progress
//             console.log('progress=>', progress)
//         }),
//         fs.createWriteStream('test.mp4')
//     );
// })();