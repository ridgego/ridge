const fs = require('fs');

// 遍历递归目录 获取所有文件
const walkSync = function(dir, filelist) {
        const files = fs.readdirSync(dir);

        filelist = filelist || [];
        files.forEach(function(file) {
            if (fs.statSync(dir + file).isDirectory()) {
                filelist = walkSync(dir + file + '/', filelist);
            } else {
                filelist.push(dir + file);
            }
        });
        filelist.push(dir);
        return filelist;
    },

    walkAndCleanFiles = function(libPath, excludes) {
        const fileList = walkSync(libPath),
            fileTobeCleaned = [];

        for (const file of fileList) {
            let excluded = true;

            for (const exclude of excludes) {
                if (file.endsWith(exclude)) {
                    excluded = false;
                }
            }
            if (excluded) {
                fileTobeCleaned.push(file);
            }
        }
        return fileTobeCleaned;
    },

    removeCleanedFile = function(files) {
        for (const file of files) {
            if (fs.statSync(file).isDirectory()) {
                try {
                    fs.rmdirSync(file);
                } catch (e) {}
            } else {
                fs.unlinkSync(file);
            }
        }
    };

module.exports = {
    walkSync,
    walkAndCleanFiles,
    removeCleanedFile
};
