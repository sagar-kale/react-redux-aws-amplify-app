
import { Auth, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap';
import './App.css';
import Login from './Login';

function App() {

  const [user, setUser] = useState(null);
  const [upload, setUpload] = useState(false);
  const [upPercent, setPercent] = useState(0);
  const [upFile, setFile] = useState(null);
  const [picture, setPicture] = useState(null);
  const [msgType, setMsgType] = useState('NA');

  useEffect(() => {

    async function getUser() {
      try {
        const usr = await Auth.currentUserInfo();
        if (usr) {
          const isProfilePicPresent = usr.attributes['custom:isProfilePicUploaded'] === 'true';
          if (isProfilePicPresent) {
            const picUrl = await Storage.get('profilePic.jpg', { level: 'private', identityId: usr.id });
            setPicture(picUrl);
          }
          setUser(usr);
          console.log('uuuuuuu..', usr.attributes);
        }
      } catch (e) { console.log('cuurent usr', e); }

    }
    getUser();
  }, []);

  function updateUserDetails(currentUser) {
    console.log('parent ', currentUser);
    setUser(currentUser);
  }


  console.log("authstate and user", user);

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setMsgType('O');
    };
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const pic = URL.createObjectURL(file);
    setFile(file);
    setPicture(pic);
  }

  const uploadPic = async () => {
    try {
      setUpload(true);
      const result = await Storage.put(`profilePic.jpg`, upFile, {
        progressCallback(progress) {
          let percent = (progress.loaded / progress.total) * 100;
          percent = Math.round(percent);
          console.log(`Uploaded: ${percent}`);
          setPercent(percent);
        },
        level: 'private',
        contentType: 'image/png' // contentType is optional
      });

      console.log('upload result...', result);
      setUpload(false);
      const loggeduser = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(loggeduser, { 'custom:isProfilePicUploaded': 'true' });
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  return (
    <> {user?.username ? (
      <div className="App">
        <Container>
          <Row className="justify-content-md-center">
            <Col sm={4}>
              <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src={picture || user.attributes.picture} />
                <Card.Body>
                  <Card.Title>Hello, {user.username}</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the bulk of
                    the card's content.
                  </Card.Text>
                  <Button variant="warning" onClick={signOut}>Sign Out</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={4}>
              <Form.Group controlId="formFile" className="mt-5">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control type="file" onChange={handleImageChange} />
              </Form.Group>
              <InputGroup className='mt-3'>
                <Button variant="outline-success" onClick={uploadPic}>Upload</Button>
              </InputGroup>
              {upload === true &&
                <div className='mt-3'>
                  <ProgressBar animated now={upPercent} striped label={`${upPercent}%`} />
                </div>}
            </Col>
          </Row>
        </Container>

      </div>
    ) : <Login updateUserDetails={updateUserDetails} msgType={msgType} />}
    </>
  );
}

export default App;
