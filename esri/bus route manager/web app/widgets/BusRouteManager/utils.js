define([],
    function () {
        return {
            toTitleCase: function (str) {
                if ((str === null) || (str === ''))
                    return '';
                else
                    str = str.toString();
                return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            },
            formatDate: function (timestamp) {
                var d = new Date(timestamp)
                console.log(d)
                var formattedDate = ''
                if (d.toString() === 'Invalid Date') {
                    return formattedDate
                }
                formattedDate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear()
                return formattedDate
            }
        }
    })