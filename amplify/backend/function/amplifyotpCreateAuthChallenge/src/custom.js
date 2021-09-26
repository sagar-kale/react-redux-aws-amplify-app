

// const accountSid = 'ACed08cfa6701098c2bb95dafb12dd31c7'
// const authToken = '929fd799acedf803b559b05c5ca4ddae';
// const client = require('twilio')(accountSid, authToken)
const { SNSClient, PublishCommand, SetSMSAttributesCommand } = require('@aws-sdk/client-sns');


exports.handler = async (event) => {

  const challengeAnswer = Math.random().toString(10).substr(2, 6);
  console.log("event requeee......", event.request);
  const phoneNumber = event.request.userAttributes.phone_number;  //sns sms
  console.log("%c otp:::::" + challengeAnswer, 'background: #222; color: #bada55');
  // Set the AWS Region.
  const REGION = "us-east-1"; //e.g. "us-east-1"
  // Create SNS service object.
  const snsClient = new SNSClient({ region: REGION });




  // Create promise and SNS service object
  try {
    // Set the parameters
    const typeparams = {
      attributes: {
        /* required */
        DefaultSMSType: "Transactional" /* highest reliability */,
        //'DefaultSMSType': 'Promotional' /* lowest cost */
      },
    };

    console.log('initiating process for setting sms type');

    snsClient.send(new SetSMSAttributesCommand(typeparams)).then(data => {
      console.log('response of settingmsg type============', data);
    }).catch(error => console.log(error));

    const params = {
      Message: `your otp is ${challengeAnswer}`,
      PhoneNumber: phoneNumber
    };


    console.log('sending msg using sns.send');

    const smsResponse = await snsClient.send(new PublishCommand(params));
    console.log("Success.........", smsResponse);


  } catch (err) {
    console.log("Error occurred setting ang publishing type:::", err.stack);
  }

  //set return params
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = challengeAnswer;
  event.response.challengeMetadata = 'CUSTOM_CHALLENGE';



  return event;
};