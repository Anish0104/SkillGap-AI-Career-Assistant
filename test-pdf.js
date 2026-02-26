const pdf = require('pdf-parse');
async function test() {
    try {
        console.log("pdf type:", typeof pdf);
        console.log("pdf keys:", Object.keys(pdf));
        if (typeof pdf === 'function') console.log("Is function");
    } catch (e) {
        console.error(e);
    }
}
test();
