import React, { useState, useEffect } from 'react'
import Image from 'react-bootstrap/Image';
import Accordion from 'react-bootstrap/Accordion';
import Col from 'react-bootstrap/Col';
import Styles from './HomePageSideBarMenu.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faBarsProgress, faTrashCan, faEdit } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import CustomModal from '../CustomModal/CustomModal';
import { DeleteWorkSpace, GetAllWorkspaces, UpdateWorkSpace } from '../../Service/WorkSpaceService';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { setData } from '../../Redux/Slices/WorkspaceAndBorderSlice';
import { AlertIcon, FormLabel, Stack, useDisclosure, Alert, Flex } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl
} from '@chakra-ui/react'
import { useFormik } from 'formik';
import { GetUserById } from '../../Service/UserService';
import { useNavigate } from 'react-router';

export default function WelcomePageSideBarMenu() {
  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)
  const dispatch = useDispatch();
  const [modalShow, setModalShow] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { token } = useSelector((x) => x.auth);
  const { userId } = useSelector((x) => x.userCredentials)
  const { workspaceId } = useSelector((state) => state.workspaceAndBoard);
  const queryClient = useQueryClient();

  const { data: ALlworkspaces } = useQuery(["GetAllworkspaces", userId], () =>
    GetAllWorkspaces(userId)
  );

  //delete workspace
  const [answer, setAnswer] = useState(false);
  const { mutate: DeleteWorks } = useMutation(
    (userId) => DeleteWorkSpace(userId, workspaceId),
    {
      onSuccess: (values) => {
        setShowAlert(true);
        queryClient.invalidateQueries("GetWorkspaceById");
        queryClient.invalidateQueries("GetAllworkspaces");
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      },
      onError: (err) => {
      },
    }
  );
  useEffect(() => {
    if (answer) {
      DeleteWorks(userId, workspaceId)
      setAnswer(false)
    }
  }, [answer]);
  //update workspace
  const UpdateWorksapceFomik = useFormik({
    initialValues: {
      title: "",
      description: "",
      workspaceId: workspaceId,
      appUserId: userId
    },
    onSubmit: async (values) => {
      values.workspaceId = workspaceId
      await Update(values);
      onClose()
    },
  });
  const { mutate: Update } = useMutation(
    (data) => UpdateWorkSpace(data),
    {
      onSuccess: async () => {
        await refetchQueries();
      },
      onError: (err) => {
      },
    }
  );

  const refetchQueries = async () => {
    await queryClient.invalidateQueries("GetWorkspaceById");
    await queryClient.invalidateQueries("GetAllworkspaces");

  };

  //update State of the selected workspace
  const updateParentState = (modalShow, Answer) => {
    setModalShow(modalShow);
    setAnswer(Answer);
  };
  const HandeUpdateClick = (data) => {
    onOpen()
    dispatch(setData({ workspaceId: data }))
  }
  const [showAlert, setShowAlert] = useState(false);
  const [ShowCreateError, setShowCreateError] = useState(false);
  const currentWorkspaceIndex = ALlworkspaces?.data?.findIndex((x) => x.id === workspaceId);

  const [index, SetInedex] = useState(currentWorkspaceIndex)
  useEffect(() => {
    SetInedex(currentWorkspaceIndex)
  }, [currentWorkspaceIndex])
  const navigate = useNavigate();
  const HandleNavigate = (data) => {
    console.log('Testing navigation to homepage');
    navigate(data);
  };
  const [Data,SetData] = useState()
  const handleGetRoles = (workspaceId) => {
    getRolesMutation(workspaceId);
  };
  const { mutate: getRolesMutation } = useMutation(
    (workspaceId) => GetUserById(userId, workspaceId),
    {
      onSuccess: (rolesData) => {
        SetData(rolesData);
      },
      onError: (err) => {
        console.error('Error fetching roles:', err);
      },
    }
  );

  return (
    <>
      <div style={{ width: "100%", maxWidth: "300px" }}>
        <ChakraProvider>
          <Stack top={0} right={0} position={'absolute'} spacing={3}>
            {showAlert && (
              <Alert status='success' variant='top-accent'>
                <AlertIcon />
                Workspace is Succesfully Deleted!
              </Alert>
            )}
            {ShowCreateError && (
              <Alert status='error' variant='top-accent'>
                <AlertIcon />
                Workspace couldn't be created!
              </Alert>
            )}
          </Stack>
        </ChakraProvider>
        <Col style={{ padding: "0 12px" }} className={Styles.sideBarMenuWrapper}>
          <Col className={Styles.sideBarMenu}>
            <Accordion className='m-auto col-11 mt-2' activeKey={`${index}`}>
              <h5 className='my-3' style={{ fontSize: "15px" }}>Your workspaces </h5>
              {ALlworkspaces?.data?.map((data, index) => {
                return (
                  <Accordion.Item onClick={() => { dispatch(setData({ workspaceId: data?.id }));   handleGetRoles(data?.id); }} key={index} className={Styles.accordionBtn} eventKey={index.toString()}>
                    <Accordion.Header >         
                      {/* ${workspaceColors[data?.id]} */}
                      <Image className={[Styles.sideBarMenuWorkspacePic, 'me-2']} src={`https://placehold.co/512x512/d9e3da/1d2125?text=${data?.title?.toUpperCase().slice(
                        0,
                        1
                      )}`} />
                      {data?.title}
                    </Accordion.Header>
                    <Accordion.Body className='d-flex flex-column p-0 mt-2'>
                      <Button onClick={() => HandleNavigate(`/members/${ALlworkspaces?.data[index]?.id}`)} className='fw-bold mb-1 w-100 text-start ps-4'><span className='me-3 text-center'><FontAwesomeIcon icon={faUserGroup} /></span>Members</Button>
                      {Data?.data === "GlobalAdmin" ? (
                        <>
                          <Button onClick={() => setModalShow(true)} className='fw-bold w-100 mb-1 text-start ps-4'><span className='me-3 text-center'><FontAwesomeIcon icon={faTrashCan} /></span>Delete</Button>
                          <Button onClick={() => HandeUpdateClick(data?.id)} className='fw-bold w-100 text-start ps-4'><span className='me-3 text-center'><FontAwesomeIcon icon={faEdit} /></span>Edit</Button>
                        </>
                      ) : null}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Col>
        </Col >
        <CustomModal
          type={'delete'}
          object={'workspace'}
          message={`Are you sure you want to delete this  workspace?`}
          title={'Delete Workspace'}
          show={modalShow}
          updateParentState={updateParentState}
        />

        <ChakraProvider>
          <Modal
            initialFocusRef={initialRef}
            finalFocusRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}

          >
            <ModalOverlay />
            <ModalContent className={Styles.Modal}>
              <ModalHeader >Update your workspace</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl>
                  <FormLabel margin={0}>Title</FormLabel>
                  <Input name='title' onChange={UpdateWorksapceFomik.handleChange} ref={initialRef} placeholder='Title' />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel margin={0}>description</FormLabel>
                  <Input name='description' onChange={UpdateWorksapceFomik.handleChange} placeholder='Description' />
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Flex gap={4}>
                  <Button className={Styles.Button} type='submit' onClick={UpdateWorksapceFomik.handleSubmit} colorScheme='blue' mr={3}>
                    Save
                  </Button>
                  <Button className={Styles.ButtonCancel} onClick={onClose}>Cancel</Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </ChakraProvider>
      </div>
    </>
  );
}