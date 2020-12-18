const { downloadWithProgressBar } = require('.');


(async () => {
    // create new container
    // const multibar = new _progress.MultiBar({
    //     // format: ' {bar} | "{filename}" | "{percentage}%" | ETA: {eta}s | {value}/{total}',
    //     format: (options, params, payload) => {
    //         const { value, total, eta } = params;
    //         const { percentage, filename } = payload;
    //         // console.log('payload', eta);
    //         const bar = options.barCompleteString.substr(0, Math.round(params.progress * options.barsize));

    //         return `${bar} | "${filename}" | "${percentage}%" | ETA: ${eta == 'NULL' ? 0 : eta}s | ${filesize(value)}/${filesize(total)}`;
    //     },
    //     hideCursor: true,
    //     barCompleteChar: '\u2588',
    //     barIncompleteChar: '\u2591',
    //     // clearOnComplete: true,
    //     stopOnComplete: true
    // });

    // console.log("Downloading files..\n");

    downloadWithProgressBar('https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-avi-file.avi', 'sample-avi-file.avi');
    downloadWithProgressBar('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1280_10MG.mp4', 'movies/test2.mp4');
    downloadWithProgressBar('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1920_18MG.mp4', '18.mp4');
    downloadWithProgressBar('http://ipv4.download.thinkbroadband.com/50MB.zip', '50MB.zip');
    downloadWithProgressBar('https://images.unsplash.com/photo-1514832510016-108f38c20162?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=dbb79afb2cb593a13ea63e3f4b393f95&auto=format', 'image.png');
})();