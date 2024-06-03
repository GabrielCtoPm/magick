const AWS = require('aws-sdk');

const aws_configs = require('../../config/aws_config');

const AWS_SES = new AWS.SES(aws_configs.SES_CONFIG);

/*
 * sends emails
 */
async function send(emailInfo){
    let params = {
      Source: emailInfo.fromEmail,
      Destination: {
        ToAddresses: emailInfo.toEmails,
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailInfo.message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: emailInfo.subject,
        }
      },
    };
    return AWS_SES.sendEmail(params).promise();
}
module.exports.send = send;
