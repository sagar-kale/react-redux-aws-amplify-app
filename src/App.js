
import { Auth, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import './App.css';
import Login from './Login';

function App() {

  const [user, setUser] = useState(null);
  const [upFile, setFile] = useState(null);
  const [picture, setPicture] = useState(null);
  const [msgType, setMsgType] = useState('NA');

  useEffect(() => {

    async function getUser() {
      try {
        const usr = await Auth.currentUserInfo()
        setUser(usr);
        console.log('uuuuuuu..', usr.attributes);
        setPicture(usr.attributes.picture);
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
      const result = await Storage.put('profilePic.jpg', upFile, {
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
        level: 'private',
        contentType: 'image/png' // contentType is optional
      });
      console.log('upload result...', result);
      const signedURL = await Storage.get(result.key);
      const loggedUser = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(loggedUser, { 'picture': signedURL });
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  return (
    <> {user ? (
      <div className="App">
        <Container>
          <Row className="justify-content-md-center">
            <Col sm={4}>
              <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src={picture} />
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
            </Col>
          </Row>
        </Container>

      </div>
    ) : <Login updateUserDetails={updateUserDetails} msgType={msgType} />}
    </>
  );
}

export default App;
