const AWS = require('aws-sdk');
const ses = new AWS.SES();
 
const RECEIVER = 'silenc8@gmail.com';
const SENDER = 'deimantas200@gmail.com';

exports.handler = function (event, context) {
    const data = JSON.parse(event.body);
    
    const params = {
        Destination: {
            ToAddresses: [
                RECEIVER
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: 'name: ' + data.name + '\nphone: ' + data.phone + '\nemail: ' + data.email + '\ndesc: ' + data.desc,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'deimantasbutenas.lt EMAIL BOT',
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    };
    
    ses.sendEmail(params, function (err, data) {
        if (err) context.fail(err);
        else context.succeed(response);
    });

    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Origin" : "https://www.deimantasbutenas.lt",
          "Content-Type": "application/javascript"
        }
    };
    
    return response;
};