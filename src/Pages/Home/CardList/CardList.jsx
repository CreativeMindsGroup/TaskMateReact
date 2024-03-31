import React, { useState, useEffect, useRef } from "react";
import Board from "react-trello";
import Styles from "./CardList.module.css";
import { transformBoardData } from "./Data";
import Modal from "react-bootstrap/Modal";
import { FocusLock, Grid, GridItem } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userSvg from "../../../Images/user.svg";
import {
  faBarsProgress,
  faEye,
  faAlignLeft,
  faListUl,
  faChevronLeft,
  faUser,
  faTag,
  faClock,
  faPaperclip,
  faCalendarDays,
  faHashtag,
  faT,
  faGrip,
  faTrowelBricks,
  faSquarePollHorizontal,
  faAnglesUp,
  faSquareCaretDown,
  faChevronRight,
  faPalette,
  faCopy,
  faSquareCheck,
  faArrowRight,
  faShareNodes,
  faXmark,
  faX,
  faEllipsis,
  faTrash,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  ChakraProvider,
  Flex,
  FormControl,
  Input,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Card from "react-bootstrap/Card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
} from "@chakra-ui/react";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import { useSelector } from "react-redux";
import { getByBoard } from "../../../Service/BoardService";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import {
  GetUsersInBoard,
  getByCard,
  getCardDelete,
} from "../../../Service/CardService";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { MenuItem, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import TextEditor from "./TextEditor/TextEditor";
import {
  CreateChecklist,
  CreateChecklistitem,
  DeleteChecklist,
  DeleteChecklistItem,
  GetAllChecklist,
  UpdateChecklistItem,
} from "../../../Service/CheckListService";
import { Progress } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Col } from "react-bootstrap";
import { CirclePicker, HuePicker } from "react-color";
import { getCardInCustomFields } from "../../../Service/CustomFieldService";
import { CreateCover } from "../../../Service/CoverService";
import { GetAdminAccess } from "../../../Service/UserService";
import TextEditorComment from "./TextEditor/TextEditorComment";
import { GetCardInComments } from "../../../Service/CommentService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TextEditorEditComment from "./TextEditor/TextEditorEditComment";
import { checkIsAdmin } from "../../../Service/AuthService";
import { GetCardInActivity } from "../../../Service/UserActivityService";

const data = require("./data.json");
const ListStyle = {
  width: "280px",
  backgroundColor: "#101204",
  borderRadius: "14px",
  marginRight: "10px",
  padding: "10px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  color: "#9fadbc",
};

const cardStyle = {
  width: "260px",
  maxWidth: "260px",
  margin: "auto",
  marginBottom: "8px",
  borderRadius: "14px",
  backgroundColor: "#22272b",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  padding: "6px 8px",
  boxSizing: "border-box",
  color: "#9fadbc",
};

const CardList = () => {
  const [modalShow, setModalShow] = useState(false);
  const [moveModalShow, setMoveModalShow] = useState(false);
  const [cardDateModalShow, setCardDateModalShow] = useState(false);
  const [commentModalShow, setCommentModalShow] = useState(false);
  const [editCommentShow, setEditCommentShow] = useState(false);
  const [activeEditIndex, setActiveEditIndex] = useState(-1);

  const [cardCustomField, setCardCustomField] = useState(false);
  const [cardActivityShow, setCardActivityShow] = useState(false);

  const [boardData, setBoardData] = useState({ lanes: [] });
  const [cardListId, SetCardListId] = useState("");
  const { BoardId, userId } = useSelector((x) => x.Data);
  const [BId, setBoardId] = useState(BoardId);
  const [card, SetCard] = useState({});
  const eventBusRef = useRef(null);

  const { data: isAdmin } = useQuery(["IsAdmin", userId], () =>
    checkIsAdmin(userId)
  );

  //Board in Users Access
  const { data: userBoardAccess } = useQuery(
    ["UserBoardAccess", userId, BoardId],
    () => GetAdminAccess(userId, BoardId)
  );

  const queryClient = useQueryClient();
  const { data: byBoard } = useQuery(["BoardInCardList", BoardId?.id], () =>
    getByBoard(BoardId)
  );
  const [dataApi, setDataApi] = useState(byBoard?.data);
  useEffect(() => {
    if (byBoard?.data) {
      setDataApi(byBoard.data);
    }
  }, [byBoard]);

  useEffect(() => {
    const fetchData = async () => {
      const newBoardData = await getBoard();
      setBoardData(newBoardData);
    };
    fetchData();
  }, [dataApi]);

  const getBoard = async () => {
    const dataCopy = JSON.parse(JSON.stringify(transformBoardData(dataApi)));

    dataCopy.lanes.forEach((lane) => {
      lane.style = { ...ListStyle };
      lane.cards.forEach((card) => {
        card.cardStyle = { ...cardStyle };
      });
    });
    return dataCopy;
  };
  const [dragCardId, setDragCardId] = useState();
  const [dragLineId, setDragLineId] = useState();

  const handleDragStart = (cardId, laneId) => {}; //El Deyme

  const handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {
    setDragCardId(cardId);
    setDragLineId(targetLaneId);
  };

  useEffect(() => {
    if (dragCardId && dragLineId) {
      dragAndDropFormik.setValues({
        CardId: dragCardId,
        CardListId: dragLineId,
      });
      dragAndDropFormik.submitForm();
    }
  }, [dragCardId, dragLineId]);

  const dragAndDropFormik = useFormik({
    initialValues: {
      AppUserId: userId,
      CardId: dragCardId,
      CardListId: dragLineId,
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append("AppUserId", userId ? userId : "");
        formData.append("CardId", dragCardId);
        formData.append("CardListId", dragLineId);

        try {
          const response = await axios.put(
            "https://localhost:7101/api/Cards/UpdateCardDragAndDrop",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 201) {
            queryClient.invalidateQueries(["BoardInCardList"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);
          }
        } catch (error) {}
      }
    },
    // validationSchema: reservationScheme,
  });

  const addCard = () => {
    if (eventBusRef.current) {
      eventBusRef.current.publish({
        type: "ADD_CARD",
        laneId: "BLOCKED",
        card: {
          id: "Ec2Error",
          title: "EC2 Instance Down",
          label: "30 mins",
          description: "Main EC2 instance down",
        },
      });
    }
  };
  const [updateCard, setUpdateCard] = useState(null);

  const shouldReceiveNewData = (nextData) => {
    const updatedCards = findUpdatedCards(boardData, nextData);
    setUpdateCard(updatedCards);
    if (updateCard !== null) {
      updateCardFormik.submitForm();
    }
  };

  const updateCardFormik = useFormik({
    initialValues: {
      CardId: updateCard && updateCard.length > 0 ? updateCard[0].id : "",
      Title: updateCard && updateCard.length > 0 ? updateCard[0].title : "",
      Description:
        updateCard && updateCard.length > 0 ? updateCard[0].description : "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append("CardId", values.CardId);
        formData.append("Title", values.Title);
        formData.append("Description", values.Description);

        try {
          const response = await axios.put(
            "https://localhost:7101/api/Cards",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 201) {
            queryClient.invalidateQueries(["BoardInCardList"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);
          }
        } catch (error) {}
      }
    },
    // validationSchema: reservationScheme,
  });

  useEffect(() => {
    if (updateCard && updateCard.length > 0 && updateCardFormik) {
      updateCardFormik.setValues({
        CardId: updateCard[0].id,
        Title: updateCard[0].title,
        Description: updateCard[0].description,
      });
    }
  }, [updateCard]);

  function findUpdatedCards(boardData, nextData) {
    const updatedCards = [];

    nextData.lanes.forEach((nextLane) => {
      const prevLane = boardData.lanes.find((lane) => lane.id === nextLane.id);

      if (prevLane) {
        nextLane.cards.forEach((nextCard) => {
          const prevCard = prevLane.cards.find(
            (card) => card.id === nextCard.id
          );

          // Kartın title veya description alanında değişiklik var mı kontrol et
          if (
            prevCard &&
            (prevCard.title !== nextCard.title ||
              prevCard.description !== nextCard.description)
          ) {
            updatedCards.push(nextCard);
          }
        });
      }
    });

    return updatedCards;
  }

  const formik = useFormik({
    initialValues: {
      AppUserId: userId,
      Title: card.title,
      Description: card.description,
      CardListId: cardListId,
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append("AppUserId", userId ? userId : "");
        formData.append("Title", card.title);
        formData.append("Description", card.description);
        formData.append("CardListId", cardListId);

        try {
          const response = await axios.post(
            "https://localhost:7101/api/Cards",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 201) {
            queryClient.invalidateQueries(["BoardInCardList"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);
          }
        } catch (error) {}
      }
    },
    // validationSchema: reservationScheme,
  });

  const handleCardAdd = (card, laneId) => {
    SetCard(card);
    SetCardListId(laneId);
  };

  useEffect(() => {
    if (card?.title && cardListId) {
      formik.setValues({ Title: card.title, CardListId: cardListId });
      formik.submitForm();
    }
  }, [card, cardListId]);

  const setEventBus = (eventBus) => {
    eventBusRef.current = eventBus;
  };

  const [cardId, setCardId] = useState(null);

  const handleCardClick = (cardId, metadata, laneId) => {
    setModalShow(true);
    setCardId(cardId);
  };

  const { data: thisCard, isSuccess } = useQuery(
    ["ModalCardDetails", cardId],
    () => getByCard(cardId),
    {
      enabled: !!cardId,
    }
  );

  const reservFormik = useFormik({
    initialValues: {
      AppUserId: userId,
      Title: "",
      BoardId: BoardId,
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();
        formData.append("AppUserId", userId);
        formData.append("Title", values.Title);
        formData.append("BoardsId", BoardId);
        try {
          const response = await axios.post(
            "https://localhost:7101/api/CardLists",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 201) {
            queryClient.invalidateQueries(["BoardInCardList"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
          }
        } catch (error) {}
      }
    },
    // validationSchema: reservationScheme,
  });
  const { mutate } = useMutation(
    ({ AppUserId, CardId }) => getCardDelete(AppUserId, CardId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["BoardInCardList"]);
        queryClient.invalidateQueries(["BoardUserActivity"]);
      },
      onError: (error) => {},
    }
  );

  const [openModal, setOpenModal] = useState();
  const HandeOpenModal = () => {
    setOpenModal(!openModal);
  };
  const CreateChecklistFormik = useFormik({
    initialValues: {
      AppUserId: "",
      Name: "",
      CardId: "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData2 = new FormData();
        formData2.append("AppUserId", userId ? userId : "");
        formData2.append("Name", values.Name);
        formData2.append("CardId", values.CardId);
        await AddChekclistMutation(formData2);
        queryClient.cancelQueries(["getAllCheklist", cardId]);
      }
    },
  });
  const { mutate: AddChekclistMutation } = useMutation(
    (data) => CreateChecklist(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllCheklist");
        queryClient.invalidateQueries("BoardUserActivity");
        queryClient.invalidateQueries(["CardInActivity"]);
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );
  const { data: ChecklistData } = useQuery(["getAllCheklist", cardId], () =>
    GetAllChecklist(cardId)
  );
  const cardDelete = async (userId, cardId) => {
    mutate({ AppUserId: userId, CardId: cardId });
  };
  const handleCardDelete = (cardId) => {
    cardDelete(userId, cardId);
  };
  const handleOnLaneDelete = (laneId) => {
    if (eventBusRef.current) {
      eventBusRef.current.publish({ type: "REMOVE_LANE", laneId: laneId });
    }
  };
  const handleCheckboxChange = async (data, isChecked) => {
    console.log(data);
    UpdateChecklistItemsFormik.setFieldValue("Check", isChecked);
    UpdateChecklistItemsFormik.setFieldValue("Text", data.text);
    UpdateChecklistItemsFormik.setFieldValue("DueDate", data.dueDate);
    UpdateChecklistItemsFormik.setFieldValue("Id", data.id);
    await UpdateChecklistItemsFormik.submitForm();
  };

  const [dateInput, setDateInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  const handleCreateItem = async (id) => {
    CreateChecklistItemFormik.setFieldValue("ChecklistId", id);
    await CreateChecklistItemFormik.submitForm();
  };
  const CreateChecklistItemFormik = useFormik({
    initialValues: {
      AppUserId: "",
      Text: "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();
        formData.append("AppUserId", userId ? userId : "");
        formData.append("Text", values.Text);
        formData.append("ChecklistId", values.ChecklistId);
        await AddChekclistitemMutation(formData);
        queryClient.cancelQueries(["getAllCheklist", cardId]);
      }
    },
  });
  const { mutate: AddChekclistitemMutation } = useMutation(
    (Id) => CreateChecklistitem(Id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllCheklist");
        queryClient.invalidateQueries("BoardUserActivity");
        queryClient.invalidateQueries(["CardInActivity"]);
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );
  const HandeUpdateCheckList = async (data) => {
    const padZero = (num) => (num < 10 ? `0${num}` : num);
    const now = new Date();
    const selectedDate = dateInput ? new Date(dateInput) : now;
    const selectedTime = timeInput
      ? timeInput.split(":")
      : [now.getHours(), now.getMinutes()];
    const dueDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(selectedTime[0]),
      parseInt(selectedTime[1])
    );
    const formattedDueDate = `${dueDate.getFullYear()}-${padZero(
      dueDate.getMonth() + 1
    )}-${padZero(dueDate.getDate())}T${padZero(dueDate.getHours())}:${padZero(
      dueDate.getMinutes()
    )}:${padZero(dueDate.getSeconds())}`;
    UpdateChecklistItemsFormik.setFieldValue("Check", data.check);
    UpdateChecklistItemsFormik.setFieldValue("Text", data.text);
    UpdateChecklistItemsFormik.setFieldValue("DueDate", formattedDueDate);
    UpdateChecklistItemsFormik.setFieldValue("Id", data.id);
    await UpdateChecklistItemsFormik.submitForm();
  };

  const HandeRemoveDateİnCheckList = async (data) => {
    UpdateChecklistItemsFormik.setFieldValue("Check", data.check);
    UpdateChecklistItemsFormik.setFieldValue("Text", data.text);
    UpdateChecklistItemsFormik.setFieldValue("DueDate", "");
    UpdateChecklistItemsFormik.setFieldValue("Id", data.id);
    await UpdateChecklistItemsFormik.submitForm();
  };
  const HandeTitleİnCheckList = async (data) => {
    UpdateChecklistItemsFormik.setFieldValue("Check", data.check);
    if (titleInput !== undefined && titleInput && titleInput.trim() !== "") {
      UpdateChecklistItemsFormik.setFieldValue("Text", titleInput);
    } else {
      UpdateChecklistItemsFormik.setFieldValue("Text", data.text);
      console.log(data.text);
    }
    UpdateChecklistItemsFormik.setFieldValue("DueDate", data.dueDate);
    UpdateChecklistItemsFormik.setFieldValue("Id", data.id);
    await UpdateChecklistItemsFormik.submitForm();
  };

  const UpdateChecklistItemsFormik = useFormik({
    initialValues: {
      AppUserId: "",
      Id: "",
      Text: "",
      DueDate: "",
      Check: "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();
        formData.append("AppUserId", userId ? userId : "");
        formData.append("Id", values.Id);
        formData.append("Text", values.Text);
        formData.append("DueDate", values.DueDate);
        formData.append("Check", values.Check);
        await UpdateChecklistItem(formData);
        queryClient.invalidateQueries(["getAllCheklist", cardId]);
        queryClient.invalidateQueries(["CardInActivity"]);
      }
      queryClient.invalidateQueries(["CardInActivity"]);
      queryClient.invalidateQueries(["BoardUserActivity"]);
    },
  });
  const HandeDeleteCheklistItem = (Id) => {
    DeleteChekclistItem(Id);
  };
  const { mutate: DeleteChekclistItem } = useMutation(
    (Id) => DeleteChecklistItem(Id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllCheklist");
        queryClient.invalidateQueries("BoardUserActivity");
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );
  const [state, setState] = useState({
    ShowUpdateInputsChecklistItem: false,
    selectedIndex: 0,
  });
  const flexContainerRef = useRef(null);
  const HandeOpenChecklistItem = (index) => {
    setState({ ShowUpdateInputsChecklistItem: true, selectedIndex: index });
  };
  const CloseEditCheckList = () => {
    setState({ ShowUpdateInputsChecklistItem: false, selectedIndex: null });
  };
  const [ShowAddItem, setShowAddItem] = useState(false);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const initRef = React.useRef();
  const { mutate: DeleteChekclist } = useMutation((Id) => DeleteChecklist(Id), {
    onSuccess: () => {
      queryClient.invalidateQueries("getAllCheklist");
      queryClient.invalidateQueries("BoardUserActivity");
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const [addItemIndex, setAddItemIndex] = useState(-1);

  const [isCardDateStatus, setIsCardDateStatus] = useState(
    thisCard?.data?.isDateStatus
  );
  console.log("isCardDateStatus>>>>", isCardDateStatus);
  console.log("data>>>>", thisCard?.data);
  const handleCardDateStatusCheckboxChange = (event) => {
    setIsCardDateStatus((prev) => !prev);
    sendRequest();
  };

  useEffect(() => {
    if (isSuccess && thisCard) {
      setIsCardDateStatus(thisCard.data.isDateStatus);
    }
  }, [isSuccess, thisCard]);

  const sendRequest = () => {
    axios
      .put(
        `https://localhost:7101/api/Cards/EditCardDateStatus?CardId=${
          cardId ? cardId : ""
        }`
      )
      .then((response) => {
        // console.log('PUT request successful:', response);
      })
      .catch((error) => {
        // console.error('Error making PUT request:', error);
      });
  };

  const [isStartChecked, setIsStartChecked] = useState(false);
  const [isDueChecked, setIsDueChecked] = useState(true);
  const handleStartCheckboxChange = (event) => {
    setIsStartChecked(true);
    setIsDueChecked(false);
  };

  const handleDueCheckboxChange = (event) => {
    setIsDueChecked(true);
    setIsStartChecked(false);
  };

  const [startDate, setStartDate] = useState(null);

  const handlStartDateChange = (date) => {
    setStartDate(date);
  };

  const [dueDate, setDueDate] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(null);

  const defaultOption = "None";
  const [selectedOption, setSelectedOption] = useState(defaultOption);

  const handleDueDateChange = (date) => {
    setDueDate(date);
    calculateReminderDate(selectedOption);
  };

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
    calculateReminderDate(event.target.value);
  };

  useEffect(() => {
    calculateReminderDate(selectedOption);
  }, [dueDate, selectedOption]);

  const calculateReminderDate = (option) => {
    let reminderTime = 0;
    switch (option) {
      case "option1":
        reminderTime = 0;
        break;
      case "option2":
        reminderTime = 5;
        break;
      case "option3":
        reminderTime = 10;
        break;
      case "option4":
        reminderTime = 15;
        break;
      case "option5":
        reminderTime = 60;
        break;
      case "option6":
        reminderTime = 120;
        break;
      case "option7":
        reminderTime = 1440;
        break;
      case "option8":
        reminderTime = 2880;
        break;
      default:
        reminderTime = 0;
    }
    const millisecondsInMinute = 60000;
    const newReminderDate = new Date(
      dueDate.getTime() - reminderTime * millisecondsInMinute
    );
    setReminderDate(newReminderDate);
  };

  const cardAddDateFormik = useFormik({
    initialValues: {
      AppUserId: userId ? userId : "",
      CardId: cardId ? cardId : "",
      StartDate: startDate ? startDate : "",
      EndDate: dueDate ? dueDate : "",
      Reminder: reminderDate ? reminderDate : "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        setCardDateModalShow(false);
        const formData = new FormData();
        formData.append("AppUserId", userId ? userId : "");
        formData.append("CardId", cardId ? cardId : "");
        formData.append("StartDate", startDate ? startDate.toISOString() : "");
        formData.append("EndDate", dueDate ? dueDate.toISOString() : "");
        formData.append(
          "Reminder",
          reminderDate ? reminderDate.toISOString() : ""
        );
        try {
          const response = await axios.put(
            "https://localhost:7101/api/Cards/UpdateCard",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 200 || response.status === 204) {
            queryClient.invalidateQueries(["ModalCardDetails"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);
          }
        } catch (error) {}
      }
    },
    // validationSchema: reservationScheme,
  });
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // ----------------------------------------------------------
  const [createViewShow, setCreateViewShow] = useState(false);
  const [viewAddDripdownItemShow, setViewAddDripdownItemShow] = useState(false);

  const [isFieldChecked, setIsFieldChecked] = useState(true);
  const handleFieldCheckboxChange = (event) => {
    setIsFieldChecked(false);
  };

  const [selectedFieldTypeOption, setSelectedFieldTypeOption] = useState(0);

  const handleFieldTypeChange = (event) => {
    if (event.target.value === "option1") {
      setSelectedFieldTypeOption(0);
      setViewAddDripdownItemShow(false);
    }
    if (event.target.value === "option2") {
      setSelectedFieldTypeOption(1);
      setViewAddDripdownItemShow(false);
    }
    if (event.target.value === "option3") {
      setSelectedFieldTypeOption(2);
      setViewAddDripdownItemShow(true);
    }
    if (event.target.value === "option4") {
      setSelectedFieldTypeOption(3);
      setViewAddDripdownItemShow(false);
    }
    if (event.target.value === "option5") {
      setSelectedFieldTypeOption(4);
      setViewAddDripdownItemShow(false);
    }
  };
  const [titleField, setTitleField] = useState("");

  const handleFieldTitleInputChange = (e) => {
    setTitleField(e.target.value);
  };

  const [dropdownItem, setDropdownItem] = useState("");
  const handleDropdownItemChange = (e) => {
    setDropdownItem(e.target.value);
  };

  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorModal, setShowColorModal] = useState(false);
  const toggleColorModal = () => {
    setShowColorModal(!showColorModal);
  };
  const handleColorChange = (color, index) => {
    setSelectedColor(color.hex);
    addDropdownItemColor(index);
    console.log("index", index);
  };

  const [options, setOptions] = useState([]);
  const handleAddDropdownItemButtonClick = () => {
    if (dropdownItem.trim() === "") return;

    const newOption = {
      Option: dropdownItem,
      Color: selectedColor,
    };
    setOptions([...options, newOption]);
    setDropdownItem("");
  };

  const addDropdownItemColor = (index) => {
    const updatedOptions = options.map((option, i) => {
      if (i === index) {
        return {
          ...option,
          Color: selectedColor,
        };
      }
      return option;
    });
    setOptions(updatedOptions);
  };

  const handleRemoveDropwItemButtonClick = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // console.log("Bu", options);

  const { data: cardInCustomFields } = useQuery(
    ["CardInCustomFields", thisCard?.data?.id],
    () => getCardInCustomFields(thisCard?.data?.id),
    {
      enabled: !!thisCard?.data?.id,
    }
  );

  const createCustomField = async () => {
    const data = {
      Title: titleField ? titleField : "",
      Type: selectedFieldTypeOption ? selectedFieldTypeOption : "",
      CardId: cardId ? cardId : "",
      CardFrontOff: isFieldChecked,
      CreateCustomFieldDropdownOptions:
        selectedFieldTypeOption === 2 ? (options ? options : null) : null,
    };

    try {
      const response = await axios.post(
        "https://localhost:7101/api/CustomFields",
        data
      );
      queryClient.invalidateQueries("CardInCustomFields");
      queryClient.invalidateQueries("BoardUserActivity");
      setCardCustomField(false);
      setTitleField("");
      setSelectedFieldTypeOption(null);
    } catch (error) {}
  };
  // const [customFieldDropdownItem, setCustomFieldDropdownItem] = useState({
  //   color: '',
  //   customFieldsId: '',
  //   id: '',
  //   option: ''
  // });

  const {
    onOpen: onPopoverOpen,
    onClose: onPopoverClose,
    isOpen: isPopoverOpen,
  } = useDisclosure();
  const firstFieldRef = React.useRef(null);
  const ColorArr = [
    "#216E4E",
    "#7F5F01",
    "#A54800",
    "#AE2E24",
    "#5e4dd7",
    "#0055cc",
    "#206a83",
    "#4c6b1f",
    "#943d73",
    "#596773",
  ];
  const [selectedColor2, setSelectedColor2] = useState();
  const HandleSaveCover = async (ThisCard, isRemove) => {
    let data;
    if (isRemove) {
      data = {
        color: "0",
        cardId: ThisCard,
      };
    } else {
      data = {
        color: selectedColor2,
        cardId: ThisCard,
      };
    }
    await CreateCover(data);
    await queryClient.invalidateQueries(["ModalCardDetails"]);
    await queryClient.invalidateQueries(["BoardUserActivity"]);
  };
  const { data: BoardMembers } = useQuery(
    ["GetAllBoardMembers", BoardId],
    () => GetUsersInBoard(BoardId),
    {
      enabled: !!BoardId,
    }
  );

  //--------------------------------------------------------
  const [staticCustomFieldId, setStaticCustomFieldId] = useState();

  const createStaticCustomField = (staticFeieldId) => {
    setStaticCustomFieldId(staticFeieldId);
    staticCustomField.submitForm();
  };

  const staticCustomField = useFormik({
    initialValues: {
      staticFieldId: staticCustomFieldId ? staticCustomFieldId : "",
      CardId: cardId ? cardId : "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append(
          "staticFieldId",
          staticCustomFieldId ? staticCustomFieldId : ""
        );
        formData.append("CardId", cardId ? cardId : "");

        try {
          const response = await axios.post(
            "https://localhost:7101/api/CustomFields/CreateStaticFields",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 201) {
            queryClient.invalidateQueries(["CardInCustomFields"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);
          }
        } catch (error) {}
      }
    },
  });

  //Update CustomFields
  const [ctmFieldId, setCtmFieldId] = useState(); //Generl

  //---Number
  const [number, setNumber] = useState();

  const handleCustomFieldNumberChange = (event) => {
    setNumber(event.target.value);
  };
  const [numberHandle, setNumberHandle] = useState(false);

  const handlefieldNumber = (dataNumber, customFieldId) => {
    setNumberHandle(true);
    setNumber(dataNumber);
    setCtmFieldId(customFieldId);
  };

  useEffect(() => {
    if (numberHandle === true) {
      const timer = setTimeout(() => {
        numberFieldUpdate.submitForm();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [number]);

  const numberFieldUpdate = useFormik({
    initialValues: {
      Id: ctmFieldId ? ctmFieldId : "",
      Number: number ? number : "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append("Id", ctmFieldId ? ctmFieldId : "");
        formData.append("Number", number ? number : "");

        try {
          const response = await axios.put(
            "https://localhost:7101/api/CustomFieldsNumbers",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 200 || response.status === 204) {
            queryClient.invalidateQueries(["CardInCustomFields"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);

            setCtmFieldId(null);
          }
        } catch (error) {}
      }
    },
  });

  //---Number

  //---Text
  const [customText, setCustomText] = useState();

  const handleCustomFieldTextChange = (event) => {
    setCustomText(event.target.value);
  };
  const [customTextHandle, setCustomTextHandle] = useState(false);

  const handlefieldText = (dataText, customFieldId) => {
    setCustomTextHandle(true);
    setCustomText(dataText);
    setCtmFieldId(customFieldId);
  };

  useEffect(() => {
    if (customTextHandle === true) {
      const timer = setTimeout(() => {
        textFieldUpdate.submitForm();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [customText]);

  const textFieldUpdate = useFormik({
    initialValues: {
      Id: ctmFieldId ? ctmFieldId : "",
      Number: customText ? customText : "",
    },
    onSubmit: async (values) => {
      if (userBoardAccess?.data && userBoardAccess?.data === true) {
        const formData = new FormData();

        formData.append("Id", ctmFieldId ? ctmFieldId : "");
        formData.append("Text", customText ? customText : "");

        try {
          const response = await axios.put(
            "https://localhost:7101/api/CustomFieldTexts",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 200 || response.status === 204) {
            queryClient.invalidateQueries(["CardInCustomFields"]);
            queryClient.invalidateQueries(["BoardUserActivity"]);
            queryClient.invalidateQueries(["CardInActivity"]);

            setCtmFieldId(null);
          }
        } catch (error) {}
      }
    },
  });

  //---Text

  //---Date
  const [customFieldDate, setCustomFieldDate] = useState();

  const [customDateHandle, setCustomDateHandle] = useState(false);

  const handlefieldDate = (date, customFieldId) => {
    setCustomFieldDate(date);
    setCustomDateHandle(true);
    setCtmFieldId(customFieldId);
  };

  useEffect(() => {
    if (customDateHandle === true) {
      const timer = setTimeout(() => {
        dateFieldUpdate.submitForm();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [customFieldDate]);

  //Burdan devam eliyersen. demeli update meselesinde ey state;e gore
  //bir coxu birden update olur bug var yeni

  const dateFieldUpdate = useFormik({
    initialValues: {
      Id: ctmFieldId ? ctmFieldId : "",
      DateTime: customFieldDate ? customFieldDate.toISOString() : "",
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("Id", ctmFieldId ? ctmFieldId : "");
      formData.append(
        "DateTime",
        customFieldDate ? customFieldDate.toISOString() : ""
      );

      try {
        const response = await axios.put(
          "https://localhost:7101/api/CustomFieldDates",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200 || response.status === 204) {
          queryClient.invalidateQueries(["CardInCustomFields"]);
          queryClient.invalidateQueries(["BoardUserActivity"]);
          queryClient.invalidateQueries(["CardInActivity"]);
          setCtmFieldId(null);
        }
      } catch (error) {}
    },
  });

  // console.log("cardInCustomFields", cardInCustomFields?.data);

  const [commentShow, setCommentShow] = useState(false);

  const handleCommentSubmitted = () => {
    setCommentShow(false);
  };

  // const handleEditCommentSubmitted = () => {
  //   setEditCommentShow(false);
  // };

  const { data: CardInComments } = useQuery(["CardInAllComments", cardId], () =>
    GetCardInComments(cardId)
  );

  //Delete Comment
  const [deleteCommentId, setDeleteCommentId] = useState();
  const deleteComment = (id) => {
    setCommentModalShow(!commentModalShow);
    setDeleteCommentId(id);
  };

  function handleDeleteClick() {
    axios
      .delete(
        `https://localhost:7101/api/Comments?AppUserId=${userId}&CommentId=${deleteCommentId}`
      )
      .then((response) => {
        queryClient.invalidateQueries(["CardInAllComments"]);
        setCommentModalShow(false);
      })
      .catch((error) => {});
  }

  const [editCommentStates, setEditCommentStates] = useState({});

  const handleEditCommentSubmitted = (index) => {
    setEditCommentShow(false);
    setEditCommentStates((prevStates) => ({
      ...prevStates,
      [index]: false,
    }));
  };

  const handleEditButtonClick = (index) => {
    setEditCommentShow(!editCommentShow);
    setEditCommentStates((prevStates) => ({
      ...prevStates,
      [index]: true,
    }));
  };

  //Card in Activity

  const { data: CardInActivity } = useQuery(["CardInActivity", cardId], () =>
    GetCardInActivity(cardId)
  );

  console.log("------------->>>", CardInActivity?.data);

  return (
    <div className="h-100">
      <div style={{ display: "flex" }}>
        <Board
          className={Styles.Board}
          editable
          onCardAdd={handleCardAdd}
          data={boardData}
          draggable
          onDataChange={shouldReceiveNewData}
          eventBusHandle={setEventBus}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          onCardClick={handleCardClick}
          CreateCover
          onCardDelete={handleCardDelete}
          onLaneDelete={handleOnLaneDelete}
        ></Board>
        <div style={{ margin: "10px" }} className={Styles.createCardList}>
          <form onSubmit={reservFormik.handleSubmit}>
            <FormControl>
              <Input
                isInvalid={
                  reservFormik.errors.Title && reservFormik.touched.Title
                }
                name="Title"
                value={reservFormik.values.Title}
                onChange={reservFormik.handleChange}
                placeholder="Card List Title"
                size="sm"
              />
              <Button
                onClick={reservFormik.handleSubmit}
                className={Styles.createcardlistbtn}
                type="submit"
              >
                Create
              </Button>
            </FormControl>
          </form>
        </div>
      </div>
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
        size="xl"
        fullscreen="md-down"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="create-share-link-modal"
      >
        {thisCard ? (
          <Modal.Body
            className="p-3 mb-3 position-relative"
            id="contained-modal-title-vcenter"
          >
            {thisCard.data.coverColor && thisCard.data.coverColor !== "0" ? (
              <div
                className={Styles.Cover}
                style={{ backgroundColor: thisCard.data.coverColor }}
              >
                <Button
                  className="create-workspace-close btn-close black"
                  onClick={() => setModalShow(false)}
                ></Button>
              </div>
            ) : (
              ""
            )}
            <Modal.Title>
              <div className="container-fluid position-relative mt-2">
                <Card.Body className=" p-0px-1 position-relative d-flex">
                  <span className="me-3 fs-5">
                    <FontAwesomeIcon icon={faBarsProgress} />
                  </span>
                  <div className="py-1">
                    <Card.Subtitle className="mb-2 fs-5">
                      {" "}
                      {thisCard?.data.title}{" "}
                    </Card.Subtitle>
                    <Card.Text className="small fs-6">
                      in list{" "}
                      <a className="btn-anchor" href="">
                        Planned Tasks
                      </a>
                    </Card.Text>
                  </div>
                  {!thisCard.data.coverColor ||
                  thisCard.data.coverColor === "0" ? (
                    <Button
                      className="create-workspace-close btn-close position-absolute top-50 end-0 translate-middle-y"
                      onClick={() => setModalShow(false)}
                    ></Button>
                  ) : (
                    ""
                  )}
                </Card.Body>
              </div>
            </Modal.Title>
            <div className="w-100 d-flex container-fluid">
              <div className="me-2 w-75">
                <div className="position-relative mt-2">
                  <Card.Body className=" p-0 py-3 px-1 position-relative d-flex">
                    <span className="me-3 fs-6">
                      <FontAwesomeIcon icon={faEye} />
                    </span>
                    <div>
                      <p className="mb-2">Notifications</p>
                      <button className="btn btn-primary default-submit">
                        Watch
                      </button>
                    </div>
                  </Card.Body>
                </div>
                {thisCard?.data?.endDate !== null && (
                  <div className={Styles.DueDates}>
                    <span>Due Date</span>
                    <div>
                      <div>
                        <input
                          type="checkbox"
                          checked={isCardDateStatus === true ? true : false}
                          onChange={handleCardDateStatusCheckboxChange}
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => setCardDateModalShow((prev) => !prev)}
                        >
                          {formatDate(thisCard?.data?.endDate)}
                          <span
                            style={{
                              display:
                                thisCard?.data?.dateColor === "transparent" &&
                                isCardDateStatus === true
                                  ? ""
                                  : "none",
                              backgroundColor:
                                isCardDateStatus === true && "#1f845a",
                            }}
                          >
                            {isCardDateStatus === true ? "Complate" : "Overdue"}
                            {/* {thisCard?.data?.dateColor !== "transparent"
                              ? isCardDateStatus
                                ? "Complate"
                                : "Overdue"
                              : ""} */}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <ChakraProvider>
                  {ChecklistData?.map((Data, Index) => {
                    return (
                      <div key={Index} className={Styles.ChecklistMain}>
                        <p>{Data.name}</p>
                        <div className={Styles.ChecklistMainConatiner}>
                          <div>
                            <FontAwesomeIcon icon={faSquareCheck} />
                          </div>
                          <div className={Styles.ChecHeader}>
                            <p editable={"true"}>{Data.name}</p>
                            <button onClick={() => DeleteChekclist(Data.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                        <Flex pt={3} gap={5} alignItems={"center"}>
                          <Text fontSize={14} m={0}>
                            {Data?.checkPercentage}%
                          </Text>
                          <Progress
                            borderRadius={5}
                            h={2}
                            w={"100%"}
                            value={Data?.checkPercentage}
                          />
                        </Flex>
                        <Flex
                          alignItems={"center"}
                          w={"100%"}
                          gap={1}
                          justifyContent={"center"}
                          flexDirection={"column"}
                        >
                          {Data?.getCheckitemDtos?.map((data, index) => (
                            <>
                              <Flex
                                pl={3}
                                w={"100%"}
                                gap={3}
                                alignItems={"center"}
                                key={index}
                              >
                                {state.selectedIndex === data.id &&
                                state.ShowUpdateInputsChecklistItem === true ? (
                                  <>
                                    <Flex
                                      backgroundColor={"#A1BDD914"}
                                      padding={3}
                                      borderRadius={14}
                                      gap={2}
                                      flexDir={"column"}
                                      w={"100%"}
                                    >
                                      {/* // change-------------------------------------------------------------- */}
                                      <Input
                                        backgroundColor={"#22272B"}
                                        border={"#579DFF 1px solid"}
                                        w={"100%"}
                                        defaultValue={data.text}
                                        color={"white"}
                                        onChange={(e) => {
                                          const newValue =
                                            e.target.value.trim();
                                          if (newValue !== data.text) {
                                            setTitleInput(newValue);
                                          }
                                        }}
                                        name="Text"
                                      />
                                      <Flex
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                      >
                                        <Flex gap={2} alignItems={"center"}>
                                          <button
                                            onClick={() => {
                                              HandeTitleİnCheckList(data);
                                              CloseEditCheckList();
                                            }}
                                            style={{
                                              backgroundColor: "#579DFF",
                                              color: "#1D2125",
                                              fontSize: "14px",
                                              fontWeight: "600",
                                            }}
                                          >
                                            Save
                                          </button>
                                          <button
                                            style={{
                                              backgroundColor:
                                                "rgb(231 240 249 / 8%)",
                                              color: "#acb6c1;",
                                              fontSize: "14px",
                                              fontWeight: "600",
                                            }}
                                            onClick={() => CloseEditCheckList()}
                                          >
                                            Close
                                          </button>
                                        </Flex>
                                        <Flex gap={10} alignItems={"center"}>
                                          <Popover
                                            closeOnBlur={false}
                                            placement="left"
                                            initialFocusRef={initRef}
                                          >
                                            {({ isOpen, onClose }) => (
                                              <>
                                                <PopoverTrigger>
                                                  <Button
                                                    className={
                                                      Styles.MenuButton
                                                    }
                                                  >
                                                    <Flex
                                                      gap={2}
                                                      alignItems={"center"}
                                                    >
                                                      {data.dueDate > "2000" ? (
                                                        <>
                                                          <FontAwesomeIcon
                                                            style={{
                                                              marginBottom:
                                                                "2px",
                                                            }}
                                                            fontSize={"14px"}
                                                            icon={faClock}
                                                          />
                                                          <p
                                                            style={{
                                                              margin: "0",
                                                            }}
                                                          >
                                                            {new Date(
                                                              data.dueDate
                                                            ).toLocaleString(
                                                              "en-US",
                                                              {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "2-digit",
                                                                hour: "numeric",
                                                                minute:
                                                                  "numeric",
                                                              }
                                                            )}
                                                          </p>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <Flex
                                                            gap={2}
                                                            alignItems={
                                                              "center"
                                                            }
                                                          >
                                                            <FontAwesomeIcon
                                                              fontSize={"14px"}
                                                              icon={faClock}
                                                            />
                                                            <p
                                                              style={{
                                                                margin: "0",
                                                              }}
                                                            >
                                                              {" "}
                                                              Set due Date
                                                            </p>
                                                          </Flex>
                                                        </>
                                                      )}
                                                    </Flex>
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                  className={Styles.PopoverMain}
                                                  border={"#3a3d41 1px solid"}
                                                  backgroundColor={"#1D2125"}
                                                >
                                                  <Flex alignItems={"center"}>
                                                    <PopoverHeader
                                                      border={"none"}
                                                    >
                                                      Change due date
                                                    </PopoverHeader>
                                                    <PopoverCloseButton
                                                      style={{
                                                        marginTop: "2px",
                                                        backgroundColor:
                                                          "transparent",
                                                      }}
                                                    />
                                                  </Flex>
                                                  <PopoverBody border={"none"}>
                                                    <Flex
                                                      gap={2}
                                                      alignItems={"center"}
                                                    >
                                                      <Input
                                                        id="timeInput"
                                                        onChange={(e) =>
                                                          setDateInput(
                                                            e.target.value
                                                          )
                                                        }
                                                        defaultValue={
                                                          data.dueDate &&
                                                          new Date(
                                                            data.dueDate
                                                          ).getFullYear() < 2000
                                                            ? new Date()
                                                                .toISOString()
                                                                .split("T")[0]
                                                            : data.dueDate
                                                            ? data.dueDate.split(
                                                                "T"
                                                              )[0]
                                                            : ""
                                                        }
                                                        className={
                                                          Styles.DateInput
                                                        }
                                                        type="date"
                                                      />
                                                      <Input
                                                        onChange={(e) =>
                                                          setTimeInput(
                                                            e.target.value
                                                          )
                                                        }
                                                        defaultValue={
                                                          data.dueDate &&
                                                          new Date(
                                                            data.dueDate
                                                          ).getFullYear() < 2000
                                                            ? "12:00"
                                                            : data.dueDate
                                                            ? data.dueDate.split(
                                                                "T"
                                                              )[1]
                                                              ? data.dueDate
                                                                  .split("T")[1]
                                                                  .split(
                                                                    ":"
                                                                  )[0] +
                                                                ":" +
                                                                data.dueDate
                                                                  .split("T")[1]
                                                                  .split(":")[1]
                                                              : ""
                                                            : ""
                                                        }
                                                        className={
                                                          Styles.DateInput
                                                        }
                                                        type="time"
                                                      />
                                                    </Flex>
                                                  </PopoverBody>
                                                  <PopoverFooter
                                                    border={"none"}
                                                  >
                                                    <Flex gap={2}>
                                                      <button
                                                        onClick={() => {
                                                          HandeUpdateCheckList(
                                                            data
                                                          );
                                                          onClose();
                                                        }}
                                                        style={{
                                                          backgroundColor:
                                                            "#579DFF",
                                                          color: "#1D2125",
                                                          fontSize: "14px",
                                                          fontWeight: "600",
                                                        }}
                                                      >
                                                        Save
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          HandeRemoveDateİnCheckList(
                                                            data
                                                          );
                                                          onClose();
                                                        }}
                                                      >
                                                        Remove
                                                      </button>
                                                    </Flex>
                                                  </PopoverFooter>
                                                </PopoverContent>
                                              </>
                                            )}
                                          </Popover>
                                          <Menu>
                                            <MenuButton
                                              className={Styles.MenuButton}
                                              as={Button}
                                            >
                                              <FontAwesomeIcon
                                                icon={faEllipsis}
                                              />
                                            </MenuButton>
                                            <MenuList
                                              w={"100%"}
                                              backgroundColor={"#22272B"}
                                              border={"none"}
                                            >
                                              <MenuItem
                                                onClick={() => {
                                                  HandeDeleteCheklistItem(
                                                    data.id
                                                  );
                                                  CloseEditCheckList();
                                                }}
                                                mt={"5px !important"}
                                                w={"100% !important"}
                                              >
                                                <Flex
                                                  gap={2}
                                                  alignItems={"center"}
                                                >
                                                  <FontAwesomeIcon
                                                    fontSize={"14px"}
                                                    icon={faTrash}
                                                  />
                                                  <p
                                                    style={{
                                                      margin: "0",
                                                      padding: "0",
                                                    }}
                                                  >
                                                    Delete
                                                  </p>
                                                </Flex>
                                              </MenuItem>
                                            </MenuList>
                                          </Menu>
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                  </>
                                ) : (
                                  <>
                                    <Checkbox
                                      mb={1}
                                      checked={data.check}
                                      isChecked={data.check}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          data,
                                          e.target.checked
                                        )
                                      }
                                    />
                                    <Text
                                      userSelect={"none"}
                                      borderRadius={10}
                                      cursor={"pointer"}
                                      w={"100%"}
                                      p={"6px 12px"}
                                      _hover={{
                                        background:
                                          "var(--ds-background-neutral, #A1BDD914)",
                                      }}
                                      onClick={() =>
                                        HandeOpenChecklistItem(data.id)
                                      }
                                      m={0}
                                    >
                                      {data.text}
                                    </Text>
                                  </>
                                )}
                              </Flex>
                            </>
                          ))}
                        </Flex>
                        {!ShowAddItem && (
                          <button
                            onClick={() => {
                              setShowAddItem(!ShowAddItem);
                              setAddItemIndex(Index);
                            }}
                            style={{ margin: "20px 10px" }}
                          >
                            Add an item
                          </button>
                        )}
                        {ShowAddItem && addItemIndex === Index && (
                          <Flex
                            padding={2}
                            borderRadius={14}
                            gap={2}
                            flexDir={"column"}
                            w={"100%"}
                          >
                            <Input
                              backgroundColor={"#22272B"}
                              border={"#579DFF 1px solid"}
                              w={"100%"}
                              color={"white"}
                              placeholder="Add an Item"
                              onChange={CreateChecklistItemFormik.handleChange}
                              name="Text"
                            />
                            <Flex
                              justifyContent={"space-between"}
                              alignItems={"center"}
                            >
                              <Flex gap={2} alignItems={"center"}>
                                <button
                                  onClick={() => {
                                    CloseEditCheckList();
                                    handleCreateItem(Data.id);
                                  }}
                                  style={{
                                    backgroundColor: "#579DFF",
                                    color: "#1D2125",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Add
                                </button>
                                <button
                                  style={{
                                    backgroundColor: "rgb(231 240 249 / 8%)",
                                    color: "#acb6c1;",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                  }}
                                  onClick={() => {
                                    setShowAddItem(!ShowAddItem);
                                  }}
                                >
                                  Cancel
                                </button>
                              </Flex>
                            </Flex>
                          </Flex>
                        )}
                      </div>
                    );
                  })}
                </ChakraProvider>
                <div className="position-relative mt-2">
                  <Card.Body className=" p-0 px-1 position-relative d-flex">
                    <span className="mt-1 me-3 fs-4">
                      <FontAwesomeIcon icon={faAlignLeft} />
                    </span>
                    <div className="py-2">
                      <Card.Subtitle className="mb-2 fs-5">
                        {" "}
                        Description{" "}
                      </Card.Subtitle>
                      {/* <Form.Group
                        className="my-3"
                        controlId="create-workspace-desc"
                      >
                        <Form.Control as="textarea" rows={3} cols={80} />
                      </Form.Group> */}
                      <TextEditor description={thisCard?.data.description} />
                    </div>
                  </Card.Body>
                </div>

                <div className={Styles.CardInCustomFieldss}>
                  <div className={Styles.CardInCustomFieldssTitle}>
                    <span>
                      <FontAwesomeIcon
                        fontSize={"24px"}
                        className="me-2"
                        icon={faClipboard}
                      />
                    </span>
                    <h4>Custom Fields</h4>
                  </div>

                  {cardInCustomFields?.data &&
                    cardInCustomFields?.data?.map((customField, index) => {
                      return (
                        <div className={Styles.CustomFieldes}>
                          {customField.type === 2 && (
                            <div className={Styles.CustomFieldDropdown}>
                              <div className={Styles.CustomFieldHeader}>
                                <span>
                                  <FontAwesomeIcon icon={faSquareCaretDown} />
                                </span>
                                Dropdown
                              </div>
                              <ChakraProvider>
                                <Select size={"lg"}>
                                  {customField?.getCustomFieldDropdownOptions &&
                                    customField.getCustomFieldDropdownOptions.map(
                                      (dropdownItem, dropdownItemIndex) => {
                                        return (
                                          <option
                                            style={{
                                              backgroundColor:
                                                dropdownItem.color
                                                  ? dropdownItem.color
                                                  : "#22272B",
                                            }}
                                            value={dropdownItem.option}
                                          >
                                            {dropdownItem.option}
                                          </option>
                                        );
                                      }
                                    )}
                                </Select>
                              </ChakraProvider>
                            </div>
                          )}
                          {customField.type === 4 && (
                            <div className={Styles.CustomFieldText}>
                              <div className={Styles.CustomFieldHeader}>
                                <span>
                                  <FontAwesomeIcon icon={faT} />
                                </span>
                                Text
                              </div>
                              <ChakraProvider>
                                <Input
                                  onClick={() =>
                                    handlefieldText(
                                      customField?.getCustomFieldTextDto?.text,
                                      customField?.getCustomFieldTextDto?.id
                                    )
                                  }
                                  value={
                                    customTextHandle === false
                                      ? customField?.getCustomFieldTextDto?.text
                                      : customText
                                  }
                                  onChange={handleCustomFieldTextChange}
                                  size={"lg"}
                                  type="text"
                                  placeholder="Text"
                                />
                              </ChakraProvider>
                            </div>
                          )}
                          {customField.type === 3 && (
                            <div className={Styles.CustomFieldNumber}>
                              <div className={Styles.CustomFieldHeader}>
                                <span>
                                  <FontAwesomeIcon icon={faHashtag} />
                                </span>
                                Number
                              </div>
                              <ChakraProvider>
                                <Input
                                  onClick={() =>
                                    handlefieldNumber(
                                      customField?.getCustomFieldNumberDto
                                        ?.number,
                                      customField?.getCustomFieldNumberDto?.id
                                    )
                                  }
                                  value={
                                    customTextHandle === false
                                      ? customField?.getCustomFieldNumberDto
                                          ?.number
                                      : number
                                  }
                                  onChange={handleCustomFieldNumberChange}
                                  size={"lg"}
                                  type="number"
                                  placeholder="number"
                                />
                              </ChakraProvider>
                            </div>
                          )}
                          {customField.type === 0 && (
                            <div
                              style={{
                                display: customField.type === 0 ? "" : "none",
                              }}
                              className={Styles.CustomFieldCheckbox}
                            >
                              <div className={Styles.CustomFieldHeader}>
                                <span>
                                  <FontAwesomeIcon icon={faSquareCheck} />
                                </span>
                                Checkbox
                              </div>
                              <input
                                type="checkbox"
                                placeholder="Text"
                                size="lg"
                              />
                            </div>
                          )}
                          {customField.type === 1 && (
                            <div
                              style={{
                                display: customField.type === 1 ? "" : "none",
                              }}
                              className={Styles.CustomFieldDate}
                            >
                              <div className={Styles.CustomFieldHeader}>
                                <span>
                                  <FontAwesomeIcon icon={faCalendarDays} />
                                </span>
                                Date
                              </div>
                              <DatePicker
                                // onClick={() => handlefieldDate(customField?.getCustomFieldDateDto?.dateTime, customField?.getCustomFieldDateDto?.id)}
                                selected={
                                  customDateHandle === false
                                    ? customField?.getCustomFieldDateDto
                                        ?.dateTime
                                    : customFieldDate
                                }
                                onChange={(date) =>
                                  handlefieldDate(
                                    date,
                                    customField?.getCustomFieldDateDto?.id
                                  )
                                }
                                showTimeInput
                                dateFormat="dd/MM/yyyy h:mm aa"
                                placeholderText="+ Add date..."
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="position-relative mt-2">
                  <Card.Body className=" p-0 px-1 position-relative d-flex">
                    <span className="mt-1 me-3 fs-4">
                      <FontAwesomeIcon icon={faListUl} />
                    </span>
                    <div className="py-2 w-100">
                      <Card.Subtitle className="mb-2 fs-5 d-flex justify-content-between">
                        {" "}
                        Activity{" "}
                        <button
                          onClick={() => setCardActivityShow((prev) => !prev)}
                          className="btn btn-primary default-submit"
                        >
                          Show details
                        </button>
                      </Card.Subtitle>
                    </div>
                  </Card.Body>
                  <div className="d-flex align-items-center">
                    {userBoardAccess?.data &&
                      userBoardAccess?.data === true && (
                        <Image
                          className={Styles.workspacePic}
                          src="https://placehold.co/512x512/CDD3FF/1d2125?text=T"
                          roundedCircle
                        />
                      )}
                    {userBoardAccess?.data &&
                      userBoardAccess?.data === true &&
                      (commentShow === false ? (
                        <Form.Group
                          className="my-3 ms-2"
                          placeholder="Write a comment"
                          controlId="create-workspace-desc"
                          onClick={() => setCommentShow((prev) => !prev)}
                        >
                          <Form.Control as="textarea" rows={1} cols={80} />
                        </Form.Group>
                      ) : (
                        <TextEditorComment
                          CardId={cardId}
                          AppUserId={userId}
                          onCommentSubmitted={handleCommentSubmitted}
                        />
                      ))}
                  </div>
                </div>
                <div style={{ display: cardActivityShow ? "" : "none" }}>
                  {CardInActivity?.data &&
                    CardInActivity?.data.map((activity, index) => {
                      const formattedDate = new Date(
                        activity.createdDate
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={index}
                          style={{ marginTop: index !== 0 ? "-60px" : "20px" }}
                          className={Styles.commentss}
                        >
                          <div className={Styles.HowComment}>
                            <p style={{ marginTop: "8px" }}>
                              {activity?.userName
                                .split(" ")
                                .map((name) => name[0].toUpperCase())
                                .join("")}
                            </p>
                            <div>
                              <strong>{activity.userName}</strong>
                              <p>{formattedDate}</p>
                              {/* <p>2024 may 12 01:38</p> */}
                            </div>
                          </div>
                          <div>
                            <div>
                              <ReactQuill
                                style={{ height: "auto", paddingLeft: "35px" }}
                                value={activity.activityText}
                                fontSize={"70px"}
                                readOnly={true}
                                theme={"bubble"}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div style={{ display: cardActivityShow ? "none" : "" }}>
                  {CardInComments?.data?.map((comment, index) => (
                    <div
                      key={index}
                      style={{ marginTop: index === 0 ? "20px" : "" }}
                      className={Styles.commentss}
                    >
                      <div className={Styles.HowComment}>
                        <p style={{ marginTop: "8px" }}>UK</p>
                        <div>
                          <strong>Ulvi Kerimov</strong>
                          <p>2024 may 12 01:38</p>
                        </div>
                      </div>
                      <div>
                        {editCommentStates[index] ? (
                          <div style={{ marginLeft: "50px", marginTop: "5px" }}>
                            <TextEditorEditComment
                              CardId={cardId}
                              AppUserId={userId}
                              Message={comment.message}
                              CommentId={comment.id}
                              onEditCommentSubmitted={() =>
                                handleEditCommentSubmitted(index)
                              }
                            />
                          </div>
                        ) : (
                          <ReactQuill
                            style={{ height: "auto", paddingLeft: "35px" }}
                            value={comment.message}
                            readOnly={true}
                            theme={"bubble"}
                          />
                        )}
                        {editCommentStates[index] ? (
                          <div
                            style={{ display: "none" }}
                            className={Styles.CommentChange}
                          >
                            <button
                              onClick={() => handleEditButtonClick(index)}
                              className={Styles.CommentEdit}
                              disabled={editCommentStates[index]}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className={Styles.CommentDelete}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className={Styles.CommentChange}>
                            <button
                              style={{
                                display:
                                  comment.appUserId === userId ? "" : "none",
                              }}
                              onClick={() => handleEditButtonClick(index)}
                              className={Styles.CommentEdit}
                              disabled={editCommentStates[index]}
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                marginLeft:
                                  comment.appUserId !== userId ? "32px" : "",
                                display:
                                  isAdmin?.data === true ||
                                  comment.appUserId === userId
                                    ? ""
                                    : "none",
                              }}
                              onClick={() => deleteComment(comment.id)}
                              className={Styles.CommentDelete}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ms-2 w-25 h-100">
                <div className="container-fluid position-relative mt-2">
                  <Card.Body className=" p-0 py-3 px-1 position-relative">
                    <p className="mb-2 small fw-bold">Add to Card</p>
                    <div>
                      <ChakraProvider>
                        <Popover
                          isOpen={isOpen}
                          initialFocusRef={firstFieldRef}
                          onOpen={onOpen}
                          onClose={onClose}
                          placement="right"
                          closeOnBlur={false}
                        >
                          <PopoverTrigger>
                            <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                              <FontAwesomeIcon className="me-2" icon={faUser} />
                              Members
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className={Styles.PopoverMember}
                            p={5}
                          >
                            <FocusLock returnFocus persistentFocus={false}>
                              <PopoverCloseButton />
                              <Form
                                firstFieldRef={firstFieldRef}
                                onCancel={onClose}
                              />
                            </FocusLock>
                            <h6 className={Styles.BoardMembersHeader}>
                              Board Members
                            </h6>
                            {BoardMembers?.data?.map((data, index) => {
                              return (
                                <div key={index}>
                                  <div className={Styles.userSvgConatiner}>
                                    <Flex
                                      marginTop={2}
                                      gap={2}
                                      alignItems={"center"}
                                    >
                                      <img src={userSvg} alt="" srcset="" />
                                      {data.userName}
                                    </Flex>
                                  </div>
                                </div>
                              );
                            })}
                          </PopoverContent>
                        </Popover>
                      </ChakraProvider>
                      <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                        <FontAwesomeIcon className="me-2" icon={faTag} />
                        Labels
                      </button>
                      <button
                        onClick={HandeOpenModal}
                        className="btn btn-primary default-submit mb-2 w-100 text-start"
                      >
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faSquareCheck}
                        />
                        Checklist
                      </button>
                      {openModal && (
                        <div className={Styles.ChecklistModal}>
                          <div>
                            <h1 className={Styles.CheckListHeader}>
                              Add checklist
                              <FontAwesomeIcon
                                onClick={HandeOpenModal}
                                className={Styles.XmarkIcon}
                                icon={faXmark}
                              />
                            </h1>
                          </div>
                          <label htmlFor="Name">Title</label>
                          <input
                            onChange={CreateChecklistFormik.handleChange}
                            className={Styles.InputCheck}
                            name="Name"
                            type="text"
                          />
                          <button
                            type="submit"
                            onClick={() => {
                              CreateChecklistFormik.handleSubmit();
                              CreateChecklistFormik.setFieldValue(
                                "CardId",
                                thisCard?.data.id
                              );
                            }}
                          >
                            Add
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => setCardDateModalShow((prev) => !prev)}
                        className="btn btn-primary default-submit mb-2 w-100 text-start"
                      >
                        <FontAwesomeIcon className="me-2" icon={faClock} />
                        Dates
                      </button>
                      <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                        <FontAwesomeIcon className="me-2" icon={faPaperclip} />
                        Attachment
                      </button>

                      <>
                        <ChakraProvider>
                          <Popover
                            isOpen={isPopoverOpen}
                            initialFocusRef={firstFieldRef}
                            onOpen={onPopoverOpen}
                            onClose={onPopoverClose}
                            closeOnBlur={false}
                          >
                            <PopoverTrigger>
                              <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                                <FontAwesomeIcon
                                  className="me-2"
                                  icon={faPalette}
                                />
                                Cover
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className={Styles.CoverPopover}
                              p={5}
                            >
                              <FocusLock returnFocus persistentFocus={false}>
                                <PopoverCloseButton />
                                <h5>Select a cover</h5>
                                <Flex pb={3} gap={1} flexWrap={"wrap"}>
                                  {ColorArr.map((color, index) => (
                                    <div
                                      key={index}
                                      onClick={() => setSelectedColor2(color)}
                                      style={{
                                        backgroundColor: color,
                                        borderRadius: "2px",
                                        border:
                                          selectedColor2 === color
                                            ? "2px solid rgb(87, 157, 255)"
                                            : "none",
                                      }}
                                      className={Styles.ColorContaier}
                                    ></div>
                                  ))}
                                </Flex>
                                <Flex gap={2}>
                                  <Button
                                    style={{
                                      backgroundColor: "#6c757d",
                                      color: "white",
                                      border: "none",
                                    }}
                                    onClick={() => {
                                      HandleSaveCover(thisCard?.data?.id, true);
                                      onPopoverClose();
                                    }}
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    style={{
                                      backgroundColor: "#579dff",
                                      color: "white",
                                      border: "none",
                                    }}
                                    onClick={() => {
                                      HandleSaveCover(thisCard?.data?.id);
                                      onPopoverClose();
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Flex>
                              </FocusLock>
                            </PopoverContent>
                          </Popover>
                        </ChakraProvider>
                      </>
                      <button
                        onClick={() => setCardCustomField((prev) => !prev)}
                        className="btn btn-primary default-submit mb-2 w-100 text-start"
                      >
                        <FontAwesomeIcon className="me-2" icon={faClipboard} />
                        Custom Fields
                      </button>
                    </div>
                    <p className="mt-5 mb-2 small fw-bold">Actions</p>
                    <div>
                      <button
                        onClick={(pres) => setMoveModalShow(true)}
                        className="btn btn-primary default-submit mb-2 w-100 text-start"
                      >
                        <FontAwesomeIcon className="me-2" icon={faArrowRight} />
                        Move
                      </button>
                      <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                        <FontAwesomeIcon className="me-2" icon={faCopy} />
                        Copy
                      </button>
                    </div>
                  </Card.Body>
                </div>
              </div>
            </div>
          </Modal.Body>
        ) : (
          ""
        )}
      </Modal>

      <Modal
        show={moveModalShow}
        onHide={() => {
          setMoveModalShow(false);
        }}
        fullscreen="md-down"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        id={Styles.MainMoveModelShow}
      >
        <Modal.Body id={Styles.MoveModelShow}>
          <div className={Styles.PositionMoveModelShow}>
            <div className={Styles.headerMoveModelShow}>
              <div></div>
              <div>Move Card</div>
              <div>
                <button>X</button>
              </div>
            </div>
            <div className={Styles.centerMoveModelShow}>
              <div>
                <Dropdown id={Styles.DropDownMove} data-bs-theme="dark">
                  <Dropdown.Toggle
                    id="dropdown-button-dark-example1"
                    variant="secondary"
                  >
                    Dropdown Button
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1" active>
                      Action
                    </Dropdown.Item>
                    <Dropdown.Item href="#/action-2">
                      Another action
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-3">
                      Something else
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-4">
                      Separated link
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div>
                <Dropdown data-bs-theme="dark">
                  <Dropdown.Toggle
                    id="dropdown-button-dark-example1"
                    variant="secondary"
                  >
                    Dropdown Button
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1" active>
                      Action
                    </Dropdown.Item>
                    <Dropdown.Item href="#/action-2">
                      Another action
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-3">
                      Something else
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-4">
                      Separated link
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div>
                <Button variant="primary">Move</Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={cardDateModalShow}
        className={Styles.DateCardModal}
        onHide={() => {
          setCardDateModalShow(false);
        }}
        fullscreen="md-down"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        style={{ width: "370px" }}
        id={Styles.MainMoveModelShow}
      >
        <Modal.Body
          style={{
            backgroundColor: "#1d2125",
            width: "370px",
          }}
          id={Styles.MoveModelShow}
        >
          <div className={`date-picker open`}>
            <div
              style={{
                width: "350px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "50px",
                backgroundColor: "#1d2125",
                position: "fixed",
                zIndex: 10,
              }}
            >
              <div></div>
              <h1
                style={{
                  fontSize: "24px",
                  fontFamily: "initial",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Dates
              </h1>
              <button
                onClick={() => setCardDateModalShow((pres) => !pres)}
                style={{ color: "white", fontSize: "20px", marginRight: "5px" }}
              >
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>

            <div id={Styles.CardAddDate}>
              <div className="input" style={{ marginTop: "30px" }}>
                <button>
                  <i className="zmdi zmdi-calendar"></i>
                </button>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: isStartChecked ? "block" : "none" }}>
                  {true && (
                    <DatePicker
                      color={"red"}
                      backgroundColor={"red"}
                      selected={startDate}
                      onChange={handlStartDateChange}
                      dateFormat="dd/MM/yyyy"
                      inline
                      selectsStart
                      startDate={startDate}
                      endDate={dueDate}
                    />
                  )}
                </div>
                <div style={{ display: isDueChecked ? "block" : "none" }}>
                  {true && (
                    <DatePicker
                      backgroundColor="blue"
                      selected={dueDate}
                      onChange={handleDueDateChange}
                      inline
                      dateFormat="dd/MM/yyyy h:mm aa"
                      showTimeInput
                      timeInputLabel="Hour:"
                      timeFormat="h:mm aa"
                      timeIntervals={15}
                      timeCaption="Time"
                      selectsEnd
                      startDate={startDate}
                      endDate={dueDate}
                      minDate={startDate}
                    />
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                  }}
                >
                  <label>Start Date</label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      marginTop: "5px",
                    }}
                  >
                    <input
                      style={{
                        border: "none",
                        border: "none",
                        color: "#0c66e4",
                        backgroundColor: "#0c66e4",
                        width: "38px",
                        height: "38px",
                      }}
                      type="checkbox"
                      checked={isStartChecked}
                      onChange={handleStartCheckboxChange}
                    />
                    <div className={Styles.result}>
                      <span style={{ display: startDate ? "block" : "none" }}>
                        {startDate ? startDate.toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                  }}
                >
                  <label>Due Date</label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      marginTop: "5px",
                    }}
                  >
                    <input
                      style={{
                        border: "none",
                        border: "none",
                        color: "#0c66e4",
                        backgroundColor: "#0c66e4",
                        width: "38px",
                        height: "38px",
                      }}
                      type="checkbox"
                      checked={isDueChecked}
                      onChange={handleDueCheckboxChange}
                    />
                    <div className={Styles.result}>
                      <span style={{ display: dueDate ? "" : "none" }}>
                        {dueDate ? dueDate.toLocaleDateString() : ""}
                      </span>{" "}
                      <span style={{ display: dueDate ? "" : "none" }}>
                        {dueDate && dueDate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "20px" }}>
                <ChakraProvider>
                  <span style={{ color: "white", fontWeight: "500" }}>
                    Set due date reminder
                  </span>
                  <Select
                    id={Styles.SelectbeforeInfo}
                    borderColor={"#0c66e4"}
                    height={"50px"}
                    width={"98%"}
                    color={"white"}
                    backgroundColor={"#22272B"}
                    value={selectedOption}
                    onChange={handleChange}
                  >
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value={defaultOption}
                    >
                      {defaultOption}
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option1"
                    >
                      At time of due date
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option2"
                    >
                      5 Minutes before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option3"
                    >
                      10 Minutes before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option4"
                    >
                      15 Minutes before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option5"
                    >
                      1 Hour before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option6"
                    >
                      2 Hours before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option7"
                    >
                      1 Day before
                    </option>
                    <option
                      style={{ backgroundColor: "#22272B" }}
                      value="option8"
                    >
                      2 Days before
                    </option>
                  </Select>
                </ChakraProvider>
                <Col
                  style={{
                    color: "white",
                    marginTop: "10px",
                    fontSize: "18px",
                  }}
                >
                  Reminders will be sent to all members and watchers of this
                  card.
                </Col>
                <Col style={{ marginTop: "15px" }}>
                  <Button
                    onClick={() => cardAddDateFormik.handleSubmit()}
                    style={{ width: "98%" }}
                  >
                    Save
                  </Button>
                  <Button
                    style={{
                      width: "98%",
                      marginTop: "20px",
                      backgroundColor: "#1d2125",
                    }}
                  >
                    Remove
                  </Button>
                </Col>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={cardCustomField}
        onHide={() => {
          setCardCustomField(false);
        }}
        fullscreen="md-down"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        id={Styles.MainMoveModelShow}
      >
        <Modal.Body
          id={Styles.MoveModelShow}
          style={{ backgroundColor: "#23282b" }}
        >
          <div
            style={{ height: createViewShow ? "auto" : "" }}
            className={Styles.cardCustomFeildmain}
          >
            <div>
              <div className={Styles.cardCustomFeildmainHeader}>
                <div>
                  <span style={{ display: createViewShow ? "" : "none" }}>
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => setCreateViewShow((prev) => !prev)}
                      icon={faChevronLeft}
                    />
                  </span>
                </div>
                <div>Custom Fields</div>
                <button>
                  <FontAwesomeIcon
                    icon={faX}
                    onClick={() => setCardCustomField((prev) => !prev)}
                  />
                </button>
              </div>

              {/* ------------------------ */}
              {/* 
              <div style={{ display: createViewShow ? 'none' : '' }} className={Styles.cardCustomFeildmainCenter}>
                <div>

                  <div className={Styles.fieldGridItem}>
                    <div>
                      <div><FontAwesomeIcon style={{ marginRight: '10px' }} icon={faAnglesUp} /> Priority</div>
                      <button><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                  </div>

                </div>
              </div> */}

              {/* ------------------------ */}
              <div
                style={{ display: createViewShow ? "none" : "" }}
                className={Styles.cardCustomFeildmainCenter}
              >
                <p>SUGGESTED FIELDS</p>
                <div>
                  <div className={Styles.fieldGridItem}>
                    <div>
                      <div>
                        <FontAwesomeIcon
                          style={{ marginRight: "10px" }}
                          icon={faAnglesUp}
                        />{" "}
                        Priority
                      </div>
                      <button onClick={() => createStaticCustomField(1)}>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className={Styles.fieldGridItem}>
                    <div>
                      <div>
                        <FontAwesomeIcon
                          style={{ marginRight: "10px" }}
                          icon={faSquarePollHorizontal}
                        />{" "}
                        Status
                      </div>
                      <button onClick={() => createStaticCustomField(2)}>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className={Styles.fieldGridItem}>
                    <div>
                      <div>
                        <FontAwesomeIcon
                          style={{ marginRight: "10px" }}
                          icon={faTrowelBricks}
                        />{" "}
                        Risk
                      </div>
                      <button onClick={() => createStaticCustomField(3)}>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className={Styles.fieldGridItem}>
                    <div>
                      <div>
                        <FontAwesomeIcon
                          style={{ marginRight: "10px" }}
                          icon={faGrip}
                        />{" "}
                        Effort
                      </div>
                      <button onClick={() => createStaticCustomField(4)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{ display: createViewShow ? "none" : "" }}
                className={Styles.cardCustomFeildmainNewField}
              >
                <ButtonGroup
                  onClick={() => setCreateViewShow((prev) => !prev)}
                  style={{
                    width: "100%",
                    height: "52px",
                    backgroundColor: "#2f363b",
                    cursor: "pointer",
                    fontSize: "28px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  + New field
                </ButtonGroup>
              </div>

              <div style={{ display: createViewShow ? "" : "none" }}>
                <ChakraProvider>
                  <span className={Styles.FieldCreateTitileLabel}>Title</span>
                  <Input
                    value={titleField}
                    onChange={handleFieldTitleInputChange}
                    placeholder="Add a title..."
                    size="lg"
                  />
                  <div style={{ marginTop: "15px" }}>
                    <span className={Styles.FieldCreateTitileLabel}>Type</span>
                    <Select
                      size={"lg"}
                      value={selectedFieldTypeOption}
                      onChange={handleFieldTypeChange}
                    >
                      <option
                        style={{ backgroundColor: "#22272B" }}
                        value="option1"
                      >
                        Checkbox
                      </option>
                      <option
                        style={{ backgroundColor: "#22272B" }}
                        value="option2"
                      >
                        Date
                      </option>
                      <option
                        style={{ backgroundColor: "#22272B" }}
                        value="option3"
                      >
                        Dropdown
                      </option>
                      <option
                        style={{ backgroundColor: "#22272B" }}
                        value="option4"
                      >
                        Number
                      </option>
                      <option
                        style={{ backgroundColor: "#22272B" }}
                        value="option5"
                      >
                        Text
                      </option>
                    </Select>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    {viewAddDripdownItemShow && (
                      <div>
                        <p style={{ marginTop: "20px" }}></p>
                        <span
                          style={{ marginBottom: "-20px" }}
                          className={Styles.FieldCreateTitileLabel}
                        >
                          Options
                        </span>
                        {options.map((item, index) => (
                          <div className={Styles.indropdownItems} key={index}>
                            <div>
                              <button
                                style={{ backgroundColor: item.Color }}
                                onClick={toggleColorModal}
                                className={Styles.colorBtn}
                              ></button>
                              {showColorModal && (
                                <div
                                  style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  onClick={toggleColorModal}
                                >
                                  <div
                                    style={{
                                      backgroundColor: "#4d4f50",
                                      padding: 20,
                                      borderRadius: 10,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CirclePicker
                                      color={selectedColor}
                                      onChange={(color) =>
                                        handleColorChange(color, index)
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <input value={item.Option} />
                            <button
                              onClick={() =>
                                handleRemoveDropwItemButtonClick(index)
                              }
                            >
                              <FontAwesomeIcon
                                fontSize={"25px"}
                                icon={faTrash}
                              />
                            </button>
                          </div>
                        ))}
                        <div
                          style={{ marginTop: "20px" }}
                          className={Styles.fieldTypeDropDown}
                        >
                          <Input
                            value={dropdownItem}
                            onChange={handleDropdownItemChange}
                            placeholder="Add a title..."
                            size="lg"
                          />
                          <button onClick={handleAddDropdownItemButtonClick}>
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Col
                    style={{
                      marginTop: "30px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      style={{
                        border: "none",
                        border: "none",
                        color: "#0c66e4",
                        backgroundColor: "#0c66e4",
                        width: "32px",
                        height: "32px",
                      }}
                      type="checkbox"
                      checked={isFieldChecked}
                      onChange={handleFieldCheckboxChange}
                    />
                    <span
                      style={{ marginLeft: "20px" }}
                      className={Styles.FieldCreateTitileLabel}
                    >
                      Show field on front of card
                    </span>
                  </Col>
                  <button
                    disabled={
                      titleField === null && selectedFieldTypeOption === null
                        ? true
                        : false
                    }
                    onClick={createCustomField}
                    className={Styles.createFieldBtn}
                  >
                    Create
                  </button>
                </ChakraProvider>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={commentModalShow}
        onHide={() => {
          setCommentModalShow(false);
        }}
        id={Styles.commentModalShow}
        centered
      >
        <Modal.Body className={Styles.maincommentModalShow}>
          <div className={Styles.commentModalShowFirst}>
            <div></div>
            <p>Delete comment?</p>
            <div>
              <FontAwesomeIcon
                icon={faX}
                onClick={() => setCommentModalShow((prev) => !prev)}
              />
            </div>
          </div>
          <div className={Styles.commentModalShowSecond}>
            Deleting a comment is forever. There is no undo.
          </div>
          <button
            onClick={() => handleDeleteClick()}
            className={Styles.commentModalShowLast}
          >
            Delete comment
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CardList;
