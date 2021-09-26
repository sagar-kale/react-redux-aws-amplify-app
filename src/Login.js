import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';

const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';

function Login({ updateUserDetails, msgType }) {



    const [otp, setOtp] = useState('');
    const [number, setNumber] = useState('');
    const password = Math.random().toString(10) + 'Abc#';
    const [session, setSession] = useState(null);
    const [message, setMessage] = useState('Welcome to Demo');

    useEffect(() => {
        switch (msgType) {
            case "N":
                setMessage(NOTSIGNIN);
                break;
            case "O":
                setMessage(SIGNEDOUT);
                break;
            default:
                setMessage('Welcome to react otp demo');
                break;

        };
    }, [msgType]);

    const signIn = () => {
        setMessage(VERIFYNUMBER);
        Auth.signIn(number)
            .then((result) => {
                setSession(result);
                setMessage(WAITINGFOROTP);
            })
            .catch((e) => {
                if (e.code === 'UserNotFoundException') {
                    signUp();
                } else if (e.code === 'UsernameExistsException') {
                    setMessage(WAITINGFOROTP);
                    signIn();
                } else {

                    console.log(e.code);
                    console.error(e);
                }
            });
    };

    const signUp = async () => {
        const result = await Auth.signUp({
            username: number,
            password,
            attributes: {
                phone_number: number,
                picture: 'http://placeholder.pics/svg/100px180',
                'custom:isProfilePicUploaded': 'false'
            }
        }).then(() => signIn());
        return result;
    };

    const verifyOtp = () => {
        Auth.sendCustomChallengeAnswer(session, otp)
            .then((user) => {
                console.log("setting user after verifuying otp", user);
                setMessage(SIGNEDIN);
                setSession(null);
                Auth.currentUserInfo().then(usr => updateUserDetails(usr));
            })
            .catch((err) => {
                setMessage(err.message);
                setOtp('');
                console.log(err);
            });
    };

    console.log("session", session);

    return (
        <>
            <Container>
                <Row className="justify-content-md-center">
                    <Col sm={8}>
                        <Alert>{message}</Alert>
                        <InputGroup className='mb-3'>
                            <FormControl
                                placeholder='Phone Number (+XX)'
                                onChange={(event) => setNumber(event.target.value)}
                            />
                            <Button variant="outline-secondary" onClick={signIn}>
                                Get OTP
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
                {session && (
                    <Row className="justify-content-md-center">
                        <Col sm={8}>
                            <InputGroup className='mb-3'>
                                <FormControl
                                    placeholder='Your OTP'
                                    onChange={(event) => setOtp(event.target.value)}
                                    value={otp}
                                />

                                <Button variant='outline-secondary'
                                    onClick={verifyOtp}>
                                    Confirm
                                </Button>

                            </InputGroup>
                        </Col>
                    </Row>
                )}
            </Container>
        </>

    );


}
export default Login;


/**<Row className="justify-content-md-center">
                <Col sm={8}>
                    <Alert>{message}</Alert>
                    <InputGroup className='mb-3'>
                        <FormControl
                            placeholder='Phone Number (+XX)'
                            onChange={(event) => setNumber(event.target.value)}
                        />
                        <InputGroup.Append>
                            <Button variant='outline-secondary'
                                onClick={signIn}>
                                Get OTP
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Col>
            </Row>
            {session && (
                <Row className="justify-content-md-center">
                    <Col sm={8}>
                        <InputGroup className='mb-3'>
                            <FormControl
                                placeholder='Your OTP'
                                onChange={(event) => setOtp(event.target.value)}
                                value={otp}
                            />
                            <InputGroup.Append>
                                <Button variant='outline-secondary'
                                    onClick={verifyOtp}>
                                    Confirm
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
            )} */