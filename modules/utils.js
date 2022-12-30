const axios = require('axios');
const fs = require('fs');



const download = async (url, fileName) => {
    await axios.get(url, { responseType: "stream" })
        .then(response => {

            response.data.pipe(fs.createWriteStream(fileName));
        })
        .catch(error => {
            console.log(error);
        });
    return 'success';
};

module.exports = { download }