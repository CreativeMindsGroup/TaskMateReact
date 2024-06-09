import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Style from "./InviteBoard.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { AcceptInvite, GetWorkSpaceById } from "../../Service/WorkSpaceService";
import { toast, ToastContainer } from "react-toastify";
import jwtDecode from "jwt-decode";

export default function InviteBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const { userId, email } = useSelector((x) => x.userCredentials);
  const [decodedToken, setDecodedToken] = useState(jwtDecode(token));
  const [domainTitle, setDomainTitle] = useState("");

  useEffect(() => {
    // Update the decoded token with the email from the Redux store
    setDecodedToken((prevToken) => ({
      ...prevToken,
      Email: email
    }));
    console.log(decodedToken);

    if (!userId) {
      console.log('id not exists!');
      navigate('/');
    } else {
      console.log('id exists');
      GetWorkSpaceById(decodedToken.WorkspaceId).then(workspace => {
        setDomainTitle(workspace?.data?.title);
      }).catch(error => {
        console.error('Error fetching workspace:', error);
      });
    }
  }, [userId, email]);

  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => AcceptInvite(token,email), {
    onSuccess: () => {
      toast.success("Joined!");
      setTimeout(() => {
        navigate('/');
      }, 1000);
      queryClient.invalidateQueries("getAllusersOfWorkspce");
    },
    onError: () => {
      toast.error("Couldn't join!");
    }
  });

  const handleJoin = () => {
    console.log('hello', decodedToken);
    mutate();
  };

  return (
    <div className={Style.mainWrapper}>
      <ToastContainer />
      {decodedToken.exp > Math.floor(Date.now() / 1000) ? (
        <Col sm={6} className="d-flex align-items-center justify-content-center flex-column">
          <div className="d-flex justify-content-center">
            <h5 className="fw-bold">{decodedToken.Inviter}</h5>
            <h5 className="fw-normal mx-2">invited you to</h5>
            <h5 className="fw-bold">{domainTitle} workspace</h5>
          </div>
          <p className="mt-1">
            Looks like you need to be logged into your TaskMate account to join this workspace.
          </p>
          <div className="col-6 d-flex justify-content-center mt-0">
            <Button onClick={userId ? handleJoin : () => navigate('/')} className="default-submit w-75 ms-2 fw-bold mt-1">
              {userId ? "Accept" : "Log in"}
            </Button>
          </div>
          <a className="mt-1 btn-anchor" href="/">
            Learn more about TaskMate
          </a>
        </Col>
      ) : (
        <div style={{ color: "red", fontSize: "34px", fontFamily: "monospace" }}>
          Token has expired
        </div>
      )}
    </div>
  );
}
