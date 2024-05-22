import React, { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Styles from './CostomModal.module.css'
import { Flex } from '@chakra-ui/react';



export default function CustomModal({ show, title, object, updateParentState }) {
  const [showModal, setModalShow] = useState(show);

  const handleClick = () => {
    updateParentState(!show, false);
  };
  const handleClick2 = () => {
    updateParentState(!show, true);
  };

  useEffect(() => {
    setModalShow(show);
  }, [show]);

  return (
    <>
      <Modal

        show={showModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onHide={handleClick}
        className={Styles.Main} 
      >
        
        <Modal.Body  className={Styles.Modal} id="contained-modal-title-vcenter">
          <Row className='p-0 d-flex flex-nowrap'>
            <div className='py-2 px-3'>
              <Modal.Title id="contained-modal-title-vcenter">
                {title}
              </Modal.Title>
              <h6 className='pt-2'>Do you want to this {object}?</h6>
              <Flex justifyContent={'flex-end'} align={'center'} gap={15}>
                <Button className={`${Button}btn btn-danger`} onClick={handleClick2}>Yes</Button>
                <Button className={`${Button}btn btn-dark`} onClick={handleClick}>No</Button>
              </Flex>
            </div>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
}