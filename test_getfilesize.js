const { getFilesize } = require('./index');

(async () => {
    const size = await getFilesize('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1280_10MG.mp4');
    console.log('size', size);
})();