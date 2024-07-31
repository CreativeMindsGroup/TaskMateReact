import React, { useEffect, useState } from 'react';
import Styles from './Column.module.css';
import Task from './Task';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AddCardDueDate, AddUserToCard, ArchiveCard, CreateCheckListCustomFiled, CreateNumberCustomFiled, DownloadFile, GetAttachments, GetCustomFields, RemoveCard, RemoveCustomField, RemoveFile, RemoveUserFromCard, UpdateCardDesctiontion, UpdateChecklistCustomField, UpdateDateTime, UpdateTitle, UploadFile, createTask, getAllCardsByCardListId, getCardListItomCount } from "../../../Service/CardService";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { CreateCover } from "../../../Service/CoverService";
import { ChakraBaseProvider, ChakraProvider, CircularProgress, Container, Flex, PopoverArrow, PopoverBody, PopoverHeader, Portal, Stack, useDisclosure, Wrap, WrapItem } from '@chakra-ui/react';
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton
} from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faPalette, faPeopleGroup, faPerson, faSquareCheck, faUserGroup, faXmark } from "@fortawesome/free-solid-svg-icons";
import FocusLock from "react-focus-lock";
import { useSelector } from 'react-redux';
import { ToastContainer, toast, useToast } from 'react-toastify';
import { CreateChecklist, GetAllChecklist, RemoveCardList, UpdateChecklistItem } from '../../../Service/CheckListService';
import Checklist from '../../../Components/ChekcList/Checklist';
import { useNavigate } from 'react-router';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { CreateDropdown, CreateDropdownOptions, RemoveDropDown, SetOption, UpdateCustomNumber } from '../../../Service/CustomFieldService';
import Dvider from '../../../Components/Dvider';
import { AddUserToWorkspace } from '../../../Service/WorkSpaceService';
import { httpClient } from '../../../Utils/HttpClient';

const Column = ({ column, index, filterData }) => {
  const queryClient = useQueryClient();
  const [openCreateTaskMenu, setOpenCreateTaskMenu] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPopoverOpen, onOpen: onPopoverOpen, onClose: onPopoverClose } = useDisclosure();
  const { isOpen: isChecklistPopoverOpen, onOpen: onChecklistPopoverOpen, onClose: isChecklistPopoverClose } = useDisclosure();
  const { isOpen: isAttachmentPopoverOpen, onOpen: onAttachmentPopoverOpen, onClose: isAttachmentPopoverClose } = useDisclosure();
  const [dueDate, setDueDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state to manage editing mode
  const [selectedColor2, setSelectedColor2] = useState();
  const firstFieldRef = React.useRef();
  const { workspaceId, BoardId } = useSelector((x) => x.workspaceAndBoard);
  const { userId } = useSelector((x) => x.userCredentials);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const navigate = useNavigate()

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
  const taskData = [];

  // Filter tasks based on filterData
  const filteredTasks = filterData?.title
    ? taskData.filter(task => task.title.toLowerCase().includes(filterData.title.toLowerCase()))
    : taskData;

  const taskCreateFormik = useFormik({
    initialValues: {
      title: '',
      cardListId: column.id
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      cardListId: Yup.string().required('Card List ID is required')
    }),
    onSubmit: (values) => {
      CreateTaskMutation({
        ...values,
        order: taskData.length + 1  // Set the order based on the current number of tasks
      });
    },
  });

  const { mutate: CreateTaskMutation } = useMutation(
    (values) => createTask(values),
    {
      onSuccess: () => {
        setOpenCreateTaskMenu(false);
        queryClient.invalidateQueries(["boardData"]);
      },
      onError: (error) => {
      },
    }
  );

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    updateCardDescriptionFormik.setValues({ userId: userId, workspcaeId: workspaceId, cardId: task.id, description: task.description || '' });
    onOpen();
  };

  const { mutate: updateDescriptionMutation } = useMutation(
    (values) => UpdateCardDesctiontion(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        onClose();
      },
      onError: (error) => {
        toast.error("No Access")
      },
    }
  );

  const updateCardDescriptionFormik = useFormik({
    initialValues: {
      cardId: '',
      description: '',
      userId: userId,
      workspcaeId: workspaceId
    },
    validationSchema: Yup.object({
      // description: Yup.string().required('Description is required')
    }),
    onSubmit: (values) => {
      updateDescriptionMutation(values);
      setIsEditing(false); // Close the editing mode after saving
      queryClient.invalidateQueries(["boardData"]);
    },

  });



  const HandleSaveCover = async (ThisCard, isRemove) => {
    let data = {
      color: isRemove ? "0" : selectedColor2,
      cardId: ThisCard,
      adminId: userId,
      workspaceId: workspaceId,
    };
    await UpdateCoverMutation(data);
  };

  const { mutate: UpdateCoverMutation } = useMutation(
    (values) => CreateCover(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["boardData"]);
        onClose();
      },
      onError: (error) => {
        toast.error("No Access")
      },
    }
  );

  //edit CardNumber 
  const [isEditing4, setIsEditing4] = useState(false);
  const [editedTitle4, setEditedTitle4] = useState("");
  const [selectedCustomFieldId, SetselectedCustomFieldId] = useState(""); // Corrected state name

  const handleTitleClick4 = (id, Name) => {
    setIsEditing4(true);
    SetselectedCustomFieldId(id)
    setEditedTitle4(Name || ""); // Initialize editedTitle3 with selectedTask?.title
  };

  const handleInputChange4 = (e) => {
    setEditedTitle4(e.target.value);
  };

  const handleInputBlur4 = () => {
    setIsEditing4(false);
    const initialValues = {
      title: editedTitle4,
    };
    UpdateTitleMutation4(initialValues);
  };

  const handleKeyPress4 = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur4();
    }
  };

  const { mutate: UpdateTitleMutation4 } = useMutation(
    (data) => UpdateCustomNumber(selectedCustomFieldId, editedTitle4, userId, workspaceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("GetCustomFields");
        setIsEditing4(false);
        setEditedTitle4("");
      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );




  //edit checklistName 
  const [isEditing3, setIsEditing3] = useState(false);
  const [editedTitle3, setEditedTitle3] = useState("");
  const [selectedCardListId, setSelectedCardListId] = useState(""); // Corrected state name

  const handleTitleClick3 = () => {
    setIsEditing3(true);
    setEditedTitle3(selectedTask?.title || ""); // Initialize editedTitle3 with selectedTask?.title
  };

  const handleInputChange3 = (e) => {
    setEditedTitle3(e.target.value);
  };

  const handleInputBlur3 = () => {
    setIsEditing3(false);
    const initialValues = {
      title: editedTitle3,
      id: selectedCardListId, // Use selectedCardListId
      adminId: userId,
      workspaceId: workspaceId
    };
    UpdateTitleMutation3(initialValues);
  };

  const handleKeyPress3 = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur3();
    }
  };

  const { mutate: UpdateTitleMutation3 } = useMutation(
    (data) => UpdateChecklistItem(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        onClose();
      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );


  //edit taskname 
  const [isEditing2, setIsEditing2] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");



  const handleTitleClick = () => {
    setIsEditing2(true);
    setEditedTitle(selectedTask?.title || "");
  };

  const handleInputChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing2(false);
    const initialValues = { // Define initialValues object
      title: editedTitle, // Assuming editedTitle is the updated title
      id: selectedCardId,
      adminId: userId,
      workspaceId: workspaceId
    };
    UpdateTitleMutation(initialValues); // Call UpdateTitleMutation with initialValues
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };
  const { mutate: UpdateTitleMutation } = useMutation(
    (data) => UpdateTitle(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        onClose()
      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );

  // get Checklists 
  const { data: ChecklistData, isLoading, isError, error } = useQuery(
    ['getAllCheklist', selectedTask?.id], // First parameter is a unique key for the query
    () => GetAllChecklist(selectedTask?.id),
    {
      enabled: !!selectedTask?.id, 
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    }
  );
  const Refetch = (Id) =>{
    setTimeout(() => {
      queryClient.invalidateQueries('getAllCheklist',Id)
    }, 1400);
    console.log('send');
  }
  const [Checklists, setChecklistsData] = useState();
  useEffect(() => {
    setChecklistsData(ChecklistData)
    
    console.log("gonderdi2");
  }, [ChecklistData])

  //Create Fromik
  const CreateChecklistFormik = useFormik({
    initialValues: {
      name: "",
      cardId: "",
      appUserId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      await AddChekclistMutation(values);
    },
  });
  const { mutate: AddChekclistMutation } = useMutation(
    (data) => CreateChecklist(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllCheklist");
        queryClient.invalidateQueries("ChecklistCount");
        isChecklistPopoverClose()
      },
      onError: (err) => {
      },
    }
  );
  //Add Due Date
  const { isOpen: isDateModalOpen, onOpen: onDateModaOpen, onClose: onDateModaClose } = useDisclosure();

  const AddDueDateFormik = useFormik({
    initialValues: {
      dueDate: dueDate,
      cardId: selectedCardId,
      userId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      AddDueDateMutate(values);
      onDateModaClose()
      onClose()
    },
  });

  const { mutate: AddDueDateMutate, isLoading: DueDateLoading } = useMutation(
    (data) => AddCardDueDate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );


  //remove card Formik 
  const confirmDelete = (id) => {
    RemoveCardMutation(id);
  };
  const { mutate: RemoveCardMutation } = useMutation(
    (cardId) => RemoveCard(cardId, userId, workspaceId),
    {
      onSuccess: () => {
        onClose()
        onCloseModalDeletModal()
        queryClient.invalidateQueries("getAllCheklist");
        queryClient.invalidateQueries("boardData");
      },
      onError: (err) => {
        toast.error("No Access!")
      },
    }
  );

  const { isOpen: isModalDeletModalOpen, onOpen: onOpenModalDeletModal, onClose: onCloseModalDeletModal } = useDisclosure();
  const openRemoveCardModal = (cardId) => {
    setSelectedCardId(cardId);
    onOpenModalDeletModal();
  };
  const HandleSetIsDueDateDone = (dueDate, cardId, isDueDateDone) => {
    UpdateDueDateFormik.setFieldValue('dueDate', dueDate)
    UpdateDueDateFormik.setFieldValue('cardId', cardId)
    UpdateDueDateFormik.setFieldValue('isDueDateDone', isDueDateDone)
    UpdateDueDateFormik.handleSubmit()
  }
  const UpdateDueDateFormik = useFormik({
    initialValues: {
      cardId: "",
      workspaceId: workspaceId,
      userId: userId,
      dueDate: "",
      isDueDateDone: false
    },
    onSubmit: async (values) => {
      values.dueDate = new Date(values.dueDate).toISOString();
      UpdateDueDateMutate(values);
    },
  });

  const { mutate: UpdateDueDateMutate } = useMutation(
    (data) => UpdateDateTime(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        onClose()
      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );

  //Upload File 
  const { isOpen: isArchiveModalOpen, onOpen: onOpenArchiveModal, onClose: onCloseArchiveModal } = useDisclosure();
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    UploadFormik.setFieldValue('file', file)
  };

  const { mutate: uploadFileMutate, isLoading: uploadLoading } = useMutation(
    ({ formData, cardId, fileName, userId, workspaceId }) => UploadFile(formData, cardId, fileName, userId, workspaceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        queryClient.invalidateQueries("GetAttachments");
        // Close the popover or any UI element if needed
        isAttachmentPopoverClose();
      },
      onError: (err) => {
        toast.error(`${"No Access!"}`);
      },
    }
  );

  // Formik initialization
  const UploadFormik = useFormik({
    initialValues: {
      file: null,
      cardId: '',
      fileName: '',
    },
    onSubmit: (values) => {
      const formData = new FormData();
      if (values.file) {
        formData.append('file', values.file);
        uploadFileMutate({ formData, cardId: values.cardId, fileName: values.fileName, userId: userId, workspaceId: workspaceId });
        for (let pair of formData.entries()) {
        }
      } else {
        toast.error("File is required");
      }
    },
  });

  //Archive Data
  const ArchiveFormik = useFormik({
    initialValues: {
      isArchived: '',
      cardId: selectedCardId,
      adminId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      ArchiveMutation(values);
      onCloseArchiveModal()
    },
  });

  const { mutate: ArchiveMutation } = useMutation(
    (data) => ArchiveCard(data),
    {
      onSuccess: () => {
        onClose()
        queryClient.invalidateQueries("boardData");
        queryClient.invalidateQueries("GetArhivedCards");

      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
      },
    }
  );
  //get atachments 
  const { data: attachments, isLoading: loading } = useQuery(
    ['GetAttachments', selectedTask?.id], // Unique key for the query
    () => GetAttachments(selectedTask?.id), // Fetch attachments using the GetAttachments function
    {
      enabled: !!selectedTask?.id,
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 30 * 1,
    }
  );
  //remove file 
  const { isOpen: isRemoveFileOpen, onOpen: onRemoveFileModalOpen, onClose: onRemoveFileClose } = useDisclosure();
  const [sellectedFileId, setSellectedFileId] = useState()
  const { mutate: RemoveFileMutation } = useMutation(
    () => RemoveFile(sellectedFileId, userId, workspaceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("GetAttachments");
        onRemoveFileClose()
      },
      onError: (err) => {
        toast.error("No Access!")
      },
    }
  );
  const handleDownload = async (fileName, cardId) => {
    try {
      const fileBlob = await DownloadFile(fileName, cardId);
      const url = URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  //Custom fields 

  const [Number, setNumber] = useState('')
  const [title, SetTitle] = useState('')
  const CreateCustomField = useFormik({
    initialValues: {
      title: '',
      number2: "",
      check: false,
      cardId: "",
      workspaceId: workspaceId,
      userId: userId,
      fieldType: ""
    },
    onSubmit: async (values, { resetForm }) => {
      await CustomFieldMutation(values);
      onCloseArchiveModal();
      CreateCustomField.resetForm()
      setNumber("")
      handleSelectChange("")
      SetTitle('')
      setFieldType('')
    },
  });

  const { mutate: CustomFieldMutation } = useMutation(
    async (data) => {
      if (data?.fieldType === "number") {
        const Data2 = {
          title: title,
          number: Number,
          boardId: BoardId,
          cardId: data?.cardId,
          workspaceId: workspaceId,
          userId: userId,
        };
        return CreateNumberCustomFiled(Data2);
      }
      if (data?.fieldType === "checkbox") {
        const Data = {
          title: title,
          check: data?.check,
          boardId: BoardId,
          cardId: data?.cardId,
          workspaceId: workspaceId,
          userId: userId,
        };
        return CreateCheckListCustomFiled(Data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("GetCustomFields", selectedTask?.id);
        onCustomFieldMenuClosed();
        CreateCustomField.resetForm()
        setFieldType('')

      },
      onError: (err) => {
        toast.error(`Error: ${err.message || "No Access!"}`);
        CreateCustomField.resetForm()
      },
    }
  );
  const [fieldType, setFieldType] = useState('');

  const handleSelectChange = (event) => {
    setFieldType(event.target.value);
    CreateCustomField.handleChange(event);
  };
  //get CustomFields
  const { data: CustomFields } = useQuery(
    ['GetCustomFields', selectedTask?.id], // Unique key for the query
    () => selectedTask?.id ? GetCustomFields(selectedTask.id) : undefined, // Fetch only if selectedTask.id exists
    {
    }
  );
  const { mutate: updateChecklist } = useMutation(
    ({ id, value }) => UpdateChecklistCustomField(id, value, userId, workspaceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);
      },
      onError: (error) => {
        toast.error(`Error: ${error.message || "Failed to update checklist"}`);
      },
    }
  );

  const handleCheckboxChange = (id, value) => {
    updateChecklist({ id, value });
  };
  // Mutation to remove custom field
  const { isOpen: isRemoveCustomFieldOpen, onOpen: onRemoveCustomFieldOpen, onClose: onRemoveCustomfiledClose } = useDisclosure();
  const { mutate: removeCustomFieldMutation } = useMutation(
    (id) => RemoveCustomField(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);
        onRemoveCustomfiledClose()
      },
      onError: (error) => {
        toast.error(`No Access!`);
      },
    }
  );

  const handleDeleteField = (id) => {
    removeCustomFieldMutation({ fieldId: id, userId, workspaceId });
  };

  //remove Checklist 
  const { isOpen: isRemoveListOpen, onOpen: onRemoveListOpen, onClose: onRemoveListClose } = useDisclosure();
  const handleDeleteList = (id) => {
    DeleteListMutation({ CardlistId: id, userId, workspaceId });
  };
  const { mutate: DeleteListMutation } = useMutation(
    (id) => RemoveCardList(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        onRemoveCustomfiledClose()
      },
      onError: (error) => {
        toast.error(`No Access!`);
      },
    }
  );

  //Dropdownlist 
  const { isOpen: isCustomFiledMenuOppened, onOpen: onCustomFiledMenuOppend, onClose: onCustomFieldMenuClosed } = useDisclosure();
  const { isOpen: isColorSelectOpen, onOpen: onColorSelectOpen, onClose: onColorSelectClose } = useDisclosure();

  const [dropdownOptionsList, setDropdownOptionsList] = useState([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('');
  const [CustomfiledId, setCustomfiledId] = useState('');

  const handleAddOption = () => {
    if (newOptionName) {
      setDropdownOptionsList([
        ...dropdownOptionsList,
        { optionName: newOptionName, color: newOptionColor, order: dropdownOptionsList.length + 1 }
      ]);
      setNewOptionName('');
      setNewOptionColor('');
    }
  };
  const handleColorSelect = (color) => {
    setNewOptionColor(color);
    onColorSelectClose();
  };
  const handleDeleteOption = (index) => {
    const updatedOptions = dropdownOptionsList.filter((_, i) => i !== index).map((option, i) => ({ ...option, order: i + 1 }));
    setDropdownOptionsList(updatedOptions);
  };
  const CreateCustomDropdown = useFormik({
    initialValues: {
      title: "",
      cardId: "",
      workspaceId: workspaceId,
      boardId: BoardId,
      userId: userId,
      dropDownOptions: ""  // Set dropDownOptions directly from dropdownOptionsList
    },
    onSubmit: async (values, { resetForm }) => {
      values.dropDownOptions = dropdownOptionsList
      values.title = title
      values.cardId = selectedTask?.id
      if (values !== null) {
        await CreateCustomDropdownMutation(values);
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);
        resetForm();
      } else {
        toast.error('Title and at least one option are required.');
      }
    },
  });

  const [responseData, setResponse] = useState('');
  const { mutate: CreateCustomDropdownMutation } = useMutation(
    async (values) => CreateDropdown(values),
    {
      onSuccess: async (response) => {
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);
        onCustomFieldMenuClosed();
        onclose()
        setFieldType('');
        SetTitle('');
        setDropdownOptionsList('')
        setNewOptionName('')
        setNewOptionColor('')
        setCustomfiledId('')
        CreateCustomField.resetForm();
      },
      onError: (err) => {
        CreateCustomField.resetForm()
      },
    }
  );

  const handleOptionChange = (DropdownId, OptionId) => {
    SetOption(DropdownId, OptionId, userId, workspaceId)
      .then(response => {
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);

      })
      .catch(error => {
        console.error('Error setting option:', error);
      });
  };

  const [IdTodelete, setIdToDelete] = useState()

  //memebers 
  const { isOpen: isMemberAddOpened, onOpen: onMemberAddOpened, onClose: onMemberAddClosed } = useDisclosure();

  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (searchValue.trim()) {
        setIsMembersLoading(true);
        try {
          const response = await httpClient.get(
            `api/AppUser/SearchUserByEmailorUsername?value=${searchValue}`
          );
          setSearchResult(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsMembersLoading(false);
        }
      } else {
        setSearchResult([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  useEffect(() => {
    let interval;
    if (isMembersLoading) {
      interval = setInterval(() => {
        setLoadingDots(prev => (prev.length < 3 ? prev + "." : ""));
      }, 500);
    } else {
      setLoadingDots("");
    }

    return () => clearInterval(interval);
  }, [isMembersLoading]);

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  const AddUserToCardFormik = useFormik({
    initialValues: {
      memberId: "",
      cardId: '',
      adminId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      await AddUserToCardMutation(values);
    },
  });

  const { mutate: AddUserToCardMutation } = useMutation(
    async (values) => AddUserToCard(values),
    {
      onSuccess: async (response) => {
        queryClient.invalidateQueries(["boardData"]);
        onClose()
      },
      onError: (err) => {
      },
    }
  );
  //remove User From Card 
  const RemoveUserToWorkspaceFormik = useFormik({
    initialValues: {
      memberId: "",
      cardId: '',
      adminId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      await RemoveUserToCardMutation(values);
    },
  });

  const { mutate: RemoveUserToCardMutation } = useMutation(
    async (values) => RemoveUserFromCard(values),
    {
      onSuccess: async (response) => {
        queryClient.invalidateQueries(["boardData"]);
        onClose()
      },
      onError: (err) => {
      },
    }
  );
  //RemoveDropDown 
  const { isOpen: isRemoveDropdownOpen, onOpen: onRemoveDropdownOpen, onClose: onRemoveDropdownClose } = useDisclosure();
  const RemoveDropDownFormik = useFormik({
    initialValues: {
      dropDownId: "",
      userId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      await RemoveDropDownMutation(values);
    },
  });

  const { mutate: RemoveDropDownMutation } = useMutation(
    async (values) => RemoveDropDown(values),
    {
      onSuccess: async (response) => {
        queryClient.invalidateQueries(['GetCustomFields', selectedTask?.id]);
        // onClose()
        onRemoveDropdownClose()
      },
      onError: (err) => {
      },
    }
  );
  return (
    <div>
      <Draggable draggableId={column?.id} index={index}>
        {(provided) => (
          <div
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided?.innerRef}
            className={Styles.main}
          >

            <Flex gap={2} alignItems={'center'}>
              {isEditing3 ? (
                <Flex gap={2} alignItems={'center'}>
                  <input
                    type="text"
                    value={editedTitle3}
                    onChange={handleInputChange3}
                    onBlur={handleInputBlur3}
                    onKeyPress={handleKeyPress3}
                    className={Styles.Input}
                  />
                </Flex>
              ) : (
                <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                  <h2 style={{ margin: "0" }} onClick={() => { handleTitleClick3(); setSelectedCardListId(column?.id) }}>{column.title}</h2>
                  <span onClick={() => { onRemoveListOpen() }} style={{ cursor: 'pointer', color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                    more_vert
                  </span>
                  <ChakraProvider>
                    <Modal isOpen={isRemoveListOpen} onClose={onRemoveListClose}>
                      <ModalOverlay />
                      <ModalContent color='#9fadbc' backgroundColor="#22272B">
                        <ModalHeader>Remove</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>Are you sure you want to remove?</ModalBody>
                        <ModalFooter>
                          <Button colorScheme='red' mr={3} onClick={() => handleDeleteList(column?.id)}>
                            Delete
                          </Button>
                          <Button onClick={onRemoveListClose}>Cancel</Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </ChakraProvider>
                </Flex>
              )}
            </Flex>

            <Droppable droppableId={column.id} type='task'>
              {(provided) => (

                <div style={{ minHeight: "20px" }} className={Styles.taskList} {...provided?.droppableProps} ref={provided.innerRef}>
                  {column?.tasks?.map((task, taskIndex) => (
                    <div key={task.id} onClick={() => handleTaskClick(task)} >
                      <Task key={task.id} task={task} index={taskIndex} attachment={attachments?.data[0]?.id} />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className={Styles.CreateCardContainer}>
              {openCreateTaskMenu ? (
                <div className={Styles.createTaskContainer}>
                  <input
                    onChange={taskCreateFormik.handleChange}
                    name="title"
                    placeholder="Enter a title for this card..."
                    className={Styles.inputTask}
                    type="text"
                  />
                  <div className={Styles.createTaskButtonsContainer}>
                    <button
                      type="submit"
                      onClick={taskCreateFormik.handleSubmit}
                      className={Styles.createTaskButton}
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => setOpenCreateTaskMenu(false)}
                      className={Styles.closeButton}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setOpenCreateTaskMenu(true)} className={Styles.addTaskButton}>
                  <span className="material-symbols-outlined">add</span>
                  <p>Add a card</p>
                </div>
              )}
            </div>
            {selectedTask?.title && (
              setSelectedCardId(selectedTask?.id)
            )}
            {selectedTask?.title && (
              <ChakraProvider>
                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent className={Styles.ModalBody}>
                    {(selectedTask.coverColor && selectedTask.coverColor !== "0") && (
                      <div style={{ backgroundColor: selectedTask.coverColor }} className={Styles.CoverContent}>
                      </div>
                    )}
                    <ModalHeader onClick={handleTitleClick} className={Styles.headerTitle}>
                      <Flex gap={2} alignItems={'center'}>
                        {isEditing2 ? (
                          <Flex gap={2} alignItems={'center'}>
                            <span style={{ color: '#9fadbc', fontSize: "20px" }} className="material-symbols-outlined">
                              splitscreen_bottom
                            </span>
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              onKeyPress={handleKeyPress}
                              className={Styles.Input}
                            />
                          </Flex>

                        ) : (
                          <Flex gap={2} alignItems={'center'}>
                            <span style={{ color: '#9fadbc', fontSize: "20px" }} className="material-symbols-outlined">
                              splitscreen_bottom
                            </span>
                            {selectedTask.title}
                          </Flex>
                        )}
                      </Flex>
                    </ModalHeader>

                    <ModalCloseButton color={'#9fadbc'} />
                    <ModalBody className={Styles.Details}>
                      <Flex gap={4} flex w={"100%"}>
                        <div style={{ width: "75%" }}>
                          {selectedTask?.dueDate && (
                            <Flex p={' 0'} flexDir={'column'} className={Styles.DueDateContainer}>
                              <p className={Styles.DueDateTitle}>Due date</p>
                              <Flex align={'center'} gap={2}>
                                <input
                                  type="checkbox"
                                  checked={selectedTask.isDueDateDone}
                                  onClick={(event) => {
                                    HandleSetIsDueDateDone(selectedTask.dueDate, selectedTask.id, event.target.checked);
                                  }}
                                />
                                <p className={Styles.DueDate} style={{ borderRadius: "5px", padding: "2px" }}>
                                  <Flex p={1} backgroundColor={"#a1bdd914"} gap={2} align={'center'}>
                                    <p className={Styles.DueDate}>
                                      {selectedTask?.dueDate && new Date(selectedTask.dueDate).toLocaleString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </p>
                                    {selectedTask.isDueDateDone &&
                                      <p style={{ borderRadius: "3px", padding: '1px', margin: "0", fontSize: "14px", backgroundColor: "#4bce97", color: "#1d2125" }}>done</p>
                                    }
                                  </Flex>
                                </p>
                              </Flex>

                            </Flex>
                          )}
                          <ChakraProvider>
                            <Container w={"100%"} p={'10px 0'}>
                              {selectedTask?.appUsers?.length > 0 && (<>
                                <p style={{ margin: '5px 0', color: '#9fadbc' }}>Members</p>
                                <Flex maxW={'100%'} flexWrap={'wrap'} gap={1}>
                                  {selectedTask?.appUsers?.map((member, index) => (
                                    <Popover arrowSize={0} closeOnBlur={true} key={index}>
                                      <PopoverTrigger>
                                        <Avatar border={'1px solid #74879c6c'} boxSize='33px' size={'s'} fontWeight={'600'} name={member.email} cursor="pointer" />
                                      </PopoverTrigger>
                                      <PopoverContent className={Styles.PopoverMembers}>
                                        <PopoverCloseButton />
                                        <PopoverBody paddingTop={4}>
                                          <p style={{ margin: "0", fontSize: "16px" }}>
                                            {member.email}
                                          </p>
                                          <Dvider color="rgb(159 173 188 / 24%)" m={"10px 0"} />
                                          <button
                                            onClick={() => {
                                              RemoveUserToWorkspaceFormik.setFieldValue("memberId", member.id);
                                              RemoveUserToWorkspaceFormik.setFieldValue("cardId", selectedTask?.id);
                                              RemoveUserToWorkspaceFormik.handleSubmit()
                                            }}>Remove from card</button>
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>
                                  ))}
                                </Flex>
                              </>
                              )}
                            </Container>
                          </ChakraProvider>
                          <form onSubmit={updateCardDescriptionFormik.handleSubmit}
                          >
                            <input
                              type="hidden"
                              name="cardId"
                              value={updateCardDescriptionFormik.values.cardId}
                              onChange={updateCardDescriptionFormik.handleChange}
                            />
                            <div>
                              <Flex justifyContent={'space-between'} alignItems={'center'}>
                                <Flex gap={2} alignItems={'center'}>
                                  <span style={{ color: '#9fadbc', fontSize: "22px" }} className="material-symbols-outlined">
                                    list
                                  </span>
                                  <label className={Styles.title}>Description</label>
                                </Flex>
                              </Flex>
                              {isEditing ? (
                                <div>
                                  <textarea
                                    name="description"
                                    value={updateCardDescriptionFormik?.values?.description}
                                    onChange={updateCardDescriptionFormik.handleChange}
                                    className={Styles.inputTaskArea}
                                  />
                                  <Button onClick={updateCardDescriptionFormik.handleSubmit} className={Styles.EditButtonDesc} style={{ backgroundColor: '#67a6ff', color: "#ffff" }} type="submit" mr={3}>
                                    Save
                                  </Button>
                                  <Button className={Styles.EditButtonDesc} variant='ghost' style={{ backgroundColor: '#5b5e6136', color: "#ffff" }} onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                              ) : (
                                <textarea
                                  name="description"
                                  value={selectedTask?.description}
                                  onChange={updateCardDescriptionFormik.handleChange}
                                  className={Styles.inputTaskAreaClosed}
                                  onClick={() => setIsEditing(true)}
                                />
                              )}
                              <div>
                                <div className={Styles.Checklist}>
                                  {Checklists && Checklists.length > 0 &&
                                    Checklists.map((item) => (
                                      <Checklist Refetch={Refetch} key={item.id} data={item} />
                                    ))
                                  }
                                </div>
                              </div>

                            </div>
                          </form>
                          {CustomFields?.data?.id && (
                            <div style={{ padding: "20px 0" }}>
                              <Flex pb={3} justifyContent={'space-between'} alignItems={'center'}>
                                <Flex gap={2} alignItems={'center'}>
                                  <span style={{ color: '#9fadbc', fontSize: "22px" }} className="material-symbols-outlined">
                                    folder_copy
                                  </span>
                                  <label className={Styles.title}>Custom Fields</label>
                                </Flex>
                              </Flex>
                              <Flex flexWrap={'wrap'} gap={4} width={'100%'} p={0}>
                                {CustomFields?.data?.checkboxDto?.map(checkbox => (
                                  <Flex borderRadius={10} minW={'max-content'} width={'120px'} backgroundColor={"#4e575e9c"} p={'10px 10px'} gap={2} align={'start'} flexDirection={'column'} key={checkbox.id}>
                                    <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                                      <Flex gap={1} align={'center'}>
                                        <span style={{ color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                          task_alt
                                        </span>
                                        <p style={{ margin: 0, color: '#9fadbc', }}> {checkbox.title}</p>
                                      </Flex>
                                      <span onClick={() => { setIdToDelete(checkbox.id); onRemoveCustomFieldOpen() }} style={{ cursor: 'pointer', color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                        more_vert
                                      </span>
                                    </Flex>
                                    <input
                                      type="checkbox"
                                      checked={checkbox.check}
                                      onChange={() => handleCheckboxChange(checkbox.id, !checkbox.check)}
                                    />
                                  </Flex>
                                ))}
                                <Modal isOpen={isRemoveDropdownOpen} onClose={onRemoveDropdownClose}>
                                  <ModalOverlay />
                                  <ModalContent color='#9fadbc' backgroundColor="#22272B">
                                    <ModalHeader>Remove</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>Are you sure you want to remove this field?</ModalBody>
                                    <ModalFooter>
                                      <Button type='submit' colorScheme='red' mr={3} onClick={() => RemoveDropDownFormik.handleSubmit()}>
                                        Delete
                                      </Button>
                                      <Button onClick={onRemoveDropdownClose}>Cancel</Button>
                                    </ModalFooter>
                                  </ModalContent>
                                </Modal>
                                {CustomFields?.data?.dropDownDto?.map(data => (
                                  <Flex flexDir={'column'} borderRadius={10} minW={'max-content'} width={'120px'} backgroundColor={"#4e575e9c"} p={'10px 10px'} gap={2} align={'start'} flexDirection={'column'} key={data?.id}>
                                    <Flex w={'100%'} alignItems={'center'} >
                                      <Flex w={'100%'} alignItems={'center'} gap={3}>
                                        <span style={{ color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                          folder_copy
                                        </span>
                                        <p style={{ margin: 0, color: '#9fadbc', }}> {data?.title}</p>
                                      </Flex>
                                      <span onClick={() => { RemoveDropDownFormik.setFieldValue("dropDownId", data.id); onRemoveDropdownOpen() }} style={{ cursor: 'pointer', color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                        more_vert
                                      </span>
                                    </Flex>
                                    {data?.dropDownOptions.length > 0 ? (
                                      <select
                                        className={Styles.DropDownSellect}
                                        style={{ color: 'white', backgroundColor: data?.color ? data?.color : "#4e575e9c", cursor: 'pointer' }}
                                        name="dropdownOptions"
                                        value={data?.selectedId}
                                        onChange={e => handleOptionChange(data?.id, e.target.value)}

                                      >
                                        <option style={{ backgroundColor: "#4e575e9c" }} value="" disabled>Select an option...</option>
                                        {data?.dropDownOptions.map(option => (
                                          <option style={{ backgroundColor: option?.color, cursor: 'pointer' }} key={option.id} value={option.id}>
                                            {option.optionName}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <select
                                        className={Styles.DropDownSellect}
                                        style={{ color: 'white', backgroundColor: data?.color ? data?.color : "#4e575e9c" }}
                                        name="dropdownOptions"
                                        value={data?.selectedId}
                                        onChange={e => handleOptionChange(data?.id, e.target.value)}
                                        disabled
                                      >
                                        <option style={{ backgroundColor: "#4e575e9c" }} value="">No options available</option>
                                      </select>
                                    )}

                                  </Flex>
                                ))}
                                {CustomFields?.data?.numberDto?.map(checkbox => (
                                  <Flex borderRadius={10} minW={'max-content'} width={'120px'} backgroundColor={"#4e575e9c"} p={'10px 10px'} gap={1} align={'start'} flexDirection={'column'} key={checkbox.id}>
                                    <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                                      <Flex gap={2} align={'center'}>
                                        <span style={{ color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                          folder_copy
                                        </span>
                                        <p style={{ margin: 0, color: '#9fadbc', }}> {checkbox.title}</p>
                                      </Flex>
                                      <span onClick={() => { setIdToDelete(checkbox.id); onRemoveCustomFieldOpen() }} style={{ cursor: 'pointer', color: '#9fadbc', fontSize: "18px" }} className="material-symbols-outlined">
                                        more_vert
                                      </span>
                                    </Flex>
                                    <Flex onClick={() => handleTitleClick4(checkbox.id, checkbox.number)} maxW={'100%'} >
                                      {isEditing4 && selectedCustomFieldId === checkbox.id || checkbox.number === '' ? (
                                        <Flex mw={"100%"} gap={2} alignItems={'center'}>
                                          <span style={{ color: '#9fadbc', fontSize: "20px" }} className="material-symbols-outlined">
                                            splitscreen_bottom
                                          </span>
                                          <input
                                            style={{ width: "135px", color: "#9fadbc" }}
                                            type="text"
                                            value={editedTitle4}
                                            onChange={handleInputChange4}
                                            onBlur={handleInputBlur4}
                                            onKeyPress={handleKeyPress4}
                                            className={Styles.Input}
                                          />
                                        </Flex>
                                      ) : (
                                        <p onClick={() => handleTitleClick4(checkbox.id)} style={{ margin: 0, color: '#9fadbc' }}>
                                          {checkbox.number}
                                        </p>
                                      )}
                                    </Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            </div>
                          )}
                          <Modal isOpen={isRemoveCustomFieldOpen} onClose={onRemoveCustomfiledClose}>
                            <ModalOverlay />
                            <ModalContent color='#9fadbc' backgroundColor="#22272B">
                              <ModalHeader>Remove</ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>Are you sure you want to remove this field?</ModalBody>
                              <ModalFooter>
                                <Button colorScheme='red' mr={3} onClick={() => handleDeleteField(IdTodelete)}>
                                  Delete
                                </Button>
                                <Button onClick={onRemoveCustomfiledClose}>Cancel</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                          {attachments?.data[0]?.id &&
                            <div>

                              <Flex justifyContent={'space-between'} alignItems={'center'}>
                                <Flex gap={2} alignItems={'center'}>
                                  <span style={{ color: '#9fadbc', fontSize: "22px" }} className="material-symbols-outlined">
                                    attachment
                                  </span>
                                  <label className={Styles.title}>Attachments</label>
                                </Flex>
                              </Flex>
                              <div className={Styles.attachment}>
                                {attachments?.data?.map((attachment, index) => (
                                  < Flex key={index} onClick={() => setSellectedFileId(attachment.id)} gap={2} align={'center'} className={Styles.attachmentItem} >
                                    {attachment.fileName}
                                    <span onClick={() => { handleDownload(attachment.fileName, selectedTask.id) }} style={{ cursor: 'pointer', fontSize: "18px" }} className="material-symbols-outlined">
                                      download
                                    </span>
                                    <span style={{ fontSize: "18px", cursor: 'pointer' }} onClick={() => onRemoveFileModalOpen()} className="material-symbols-outlined">
                                      delete
                                    </span>
                                  </Flex>
                                ))}
                              </div>
                            </div>
                          }
                          <Modal isOpen={isRemoveFileOpen} onClose={onRemoveFileClose}>
                            <ModalOverlay />
                            <ModalContent color='#9fadbc' backgroundColor="#22272B">
                              <ModalHeader>Remove File</ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>Are you sure you want to remove this file?</ModalBody>
                              <ModalFooter>
                                <Button colorScheme='red' mr={3} onClick={() => RemoveFileMutation()}>
                                  Delete
                                </Button>
                                <Button onClick={onRemoveFileClose}>Cancel</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                        </div>
                        <div className={Styles.LeftContainer} style={{ width: "25%" }}>
                          <h1 className={Styles.MenuTitle}>Add to Card</h1>
                          <ChakraProvider>
                            <Popover
                              isOpen={isMemberAddOpened}
                              initialFocusRef={firstFieldRef}
                              onOpen={onMemberAddOpened}
                              onClose={onMemberAddClosed}
                              closeOnBlur={true}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faUserGroup}
                                  />
                                  <p>
                                    Members
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.ChecklistModal}
                                p={5}
                              >
                                <Flex padding={'0px 0px 15px 0px'} align={'center'} justifyContent={"space-between"}>
                                  <p>
                                  </p>
                                  <h1 className={Styles.CheckListHeader}>
                                    Members
                                  </h1>
                                  <FontAwesomeIcon
                                    onClick={() => onMemberAddClosed()}
                                    className={Styles.XmarkIcon}
                                    icon={faXmark}
                                  />
                                </Flex>
                                <>
                                  <input
                                    onChange={handleChange}
                                    className={Styles.InputCheck}
                                    name="name"
                                    type="text"
                                    placeholder='Search members ...'
                                  />
                                  {searchValue && (
                                    <>
                                      <p className={Styles.MembersTitle}>Find members</p>
                                      <Flex flexDir={'column'} gap={3}>
                                        {isMembersLoading ? (
                                          <p>Loading members{loadingDots}</p>
                                        ) : searchResult.length > 0 ? (
                                          searchResult.map((member, index) => (
                                            <Flex
                                              key={member.id} // Ensure unique key for each member
                                              onClick={() => {
                                                AddUserToCardFormik.setFieldValue("memberId", member.id);
                                                AddUserToCardFormik.setFieldValue("cardId", selectedTask?.id);
                                                AddUserToCardFormik.handleSubmit()
                                              }}
                                              cursor={'pointer'}
                                              alignItems={'center'}
                                              padding={'3px'}
                                              borderRadius={"4px"}
                                              justifyContent={'space-between'}
                                            >
                                              <Flex alignItems={'center'} gap={2}>
                                                <Avatar
                                                  border={'1px solid #74879c6c'}
                                                  name={`${member.email}`}
                                                  boxSize='30px'
                                                  size={'x'}
                                                  fontWeight={'600'}
                                                  cursor="pointer"
                                                />
                                                <p style={{ margin: '0', fontSize: "14px" }}>{member.email}</p>
                                              </Flex>
                                            </Flex>
                                          ))
                                        ) : (
                                          <p>No members found</p>
                                        )}
                                      </Flex>
                                    </>
                                  )}
                                </>
                                {selectedTask?.appUsers?.length > 0 && (
                                  <>
                                    <p className={Styles.MembersTitle}>Card members</p>
                                    <Flex flexDir={'column'} gap={3}>
                                      {selectedTask.appUsers.map((member, index) => (
                                        <Flex key={index} padding={'3px'} borderRadius={"4px"} backgroundColor={"#68717b69"} alignItems={'center'} justifyContent={'space-between'}>
                                          <Flex alignItems={'center'} gap={2}>
                                            <Avatar border={'1px solid #74879c6c'} boxSize='30px' size={'x'} fontWeight={'600'} name={member.email} cursor="pointer" />
                                            <p style={{ margin: '0', fontSize: "14px" }}> {member.email}</p>
                                          </Flex>
                                          <FontAwesomeIcon
                                            fontSize={"17px"}
                                            fontWeight={'300'}
                                            onClick={() => {
                                              RemoveUserToWorkspaceFormik.setFieldValue("memberId", member.id);
                                              RemoveUserToWorkspaceFormik.setFieldValue("cardId", selectedTask?.id);
                                              RemoveUserToWorkspaceFormik.handleSubmit()
                                            }}
                                            className={Styles.XmarkIcon}
                                            icon={faXmark}
                                          />
                                        </Flex>
                                      ))}
                                    </Flex>
                                  </>
                                )}
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>
                          <ChakraProvider>
                            <Popover
                              isOpen={isAttachmentPopoverOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onAttachmentPopoverOpen}
                              onClose={isAttachmentPopoverClose}
                              closeOnBlur={true}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <span style={{ fontSize: "17px", marginRight: 8 }} className="material-symbols-outlined">
                                    attachment
                                  </span>
                                  Attachment
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.ChecklistModal}
                                p={5}
                              >
                                <Flex align={'center'} justifyContent={"space-between"}>
                                  <p>
                                  </p>
                                  <h1 className={Styles.CheckListHeader}>
                                    Attachment
                                  </h1>
                                  <FontAwesomeIcon
                                    onClick={() => isAttachmentPopoverClose()}
                                    className={Styles.XmarkIcon}
                                    icon={faXmark}
                                  />
                                </Flex>
                                <label htmlFor="Name"> File name (optional)</label>
                                <Flex flexDirection={'column'} gap={2}>
                                  <input
                                    onChange={UploadFormik.handleChange}
                                    className={Styles.InputCheck}
                                    name="fileName"
                                    type="text"
                                  />
                                  {/* <input
                                    className={Styles.InputCheck2}
                                    onChange={UploadFormik.handleChange}
                                    name="file"
                                    type="file"
                                  /> */}
                                  <label htmlFor="file">File</label>
                                  <input
                                    id="file"
                                    name="file"
                                    type="file"
                                    onChange={(event) => {
                                      UploadFormik.setFieldValue('file', event.currentTarget.files[0]);
                                    }}
                                  />
                                </Flex>
                                <button
                                  type="submit"
                                  onClick={() => {
                                    UploadFormik.handleSubmit();
                                    UploadFormik.setFieldValue(
                                      "cardId",
                                      selectedTask?.id
                                    );
                                  }}
                                >
                                  Add
                                </button>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>

                          {/* <div className={Styles.OptionSellectButton}>Labels</div> */}
                          <ChakraProvider>
                            <Popover
                              isOpen={isChecklistPopoverOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onChecklistPopoverOpen}
                              onClose={isChecklistPopoverClose}
                              closeOnBlur={true}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faSquareCheck}
                                  />
                                  <p>
                                    Checklist
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.ChecklistModal}
                                p={5}
                              >
                                <Flex align={'center'} justifyContent={"space-between"}>
                                  <p>
                                  </p>
                                  <h1 className={Styles.CheckListHeader}>
                                    Add checklist
                                  </h1>
                                  <FontAwesomeIcon
                                    onClick={() => isChecklistPopoverClose()}
                                    className={Styles.XmarkIcon}
                                    icon={faXmark}
                                  />
                                </Flex>
                                <label htmlFor="Name">Title</label>
                                <input
                                  onChange={CreateChecklistFormik.handleChange}
                                  className={Styles.InputCheck}
                                  name="name"
                                  type="text"
                                />
                                <button
                                  type="submit"
                                  onClick={() => {
                                    CreateChecklistFormik.handleSubmit();
                                    CreateChecklistFormik.setFieldValue(
                                      "cardId",
                                      selectedTask?.id
                                    );
                                  }}
                                >
                                  Add
                                </button>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>

                          <ChakraProvider>
                            <Popover
                              isOpen={isDateModalOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onDateModaOpen}
                              onClose={onDateModaClose}
                              closeOnBlur={true}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faClock}
                                  />
                                  <p>
                                    Dates
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.DateModal}
                                p={5}
                              >
                                <Flex align={'center'} justifyContent={"space-between"}>
                                  <p>
                                  </p>
                                  <h1 className={Styles.CheckListHeader}>
                                    Dates
                                  </h1>
                                  <FontAwesomeIcon
                                    onClick={() => onDateModaClose()}
                                    className={Styles.XmarkIcon}
                                    icon={faXmark}
                                  />
                                </Flex>
                                <div style={{ margin: "20px" }}>
                                  <DatePicker
                                    selected={dueDate}
                                    onChange={(date) => {
                                      setDueDate(date);  // Update local state
                                      AddDueDateFormik.setFieldValue('dueDate', date);  // Update Formik state
                                    }}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    inline  // This makes the DatePicker always visible
                                    className="datePicker"  // Custom styling as needed
                                  />
                                </div>
                                <button
                                  onClick={() => { AddDueDateFormik.handleSubmit(); AddDueDateFormik.setFieldValue("cardId", selectedTask.id) }}
                                  disabled={DueDateLoading}
                                >
                                  {DueDateLoading ? <CircularProgress isIndeterminate size="24px" color="#579dff" /> : "Add due date"}
                                </button>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>

                          <ChakraProvider>
                            <Popover
                              isOpen={isPopoverOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onPopoverOpen}
                              onClose={onPopoverClose}
                              closeOnBlur={true}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faPalette}
                                  />
                                  <p>
                                    Cover
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.CoverPopover}
                                p={5}
                              >
                                <FocusLock returnFocus persistentFocus={false}>
                                  <PopoverCloseButton m={"14px 20px"} color={"#9fadbc"} />
                                  <h5 className={Styles.Text}>Select a cover</h5>
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
                                    <button
                                      type="button"
                                      className={Styles.EditButton}
                                      onClick={() => {
                                        HandleSaveCover(selectedTask?.id, true);
                                        onPopoverClose();
                                      }}
                                    >
                                      Remove
                                    </button>
                                    <button
                                      type="button"
                                      className={Styles.EditButton}
                                      onClick={() => {
                                        HandleSaveCover(selectedTask?.id);
                                        onPopoverClose();
                                      }}
                                    >
                                      Save
                                    </button>
                                  </Flex>
                                </FocusLock>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>
                          <ChakraProvider>
                            <Popover
                              isOpen={isCustomFiledMenuOppened}
                              initialFocusRef={firstFieldRef}
                              onOpen={onCustomFiledMenuOppend}
                              onClose={onCustomFieldMenuClosed}
                              closeOnBlur={false}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <span style={{ fontSize: "18px", paddingRight: "5px" }} className="material-symbols-outlined">
                                    folder_copy
                                  </span>
                                  Custom fields
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.ChecklistModal}
                                p={5}
                              >
                                <div>
                                  <Flex align={'center'} justifyContent={"space-between"}>
                                    <p></p>
                                    <h1 className={Styles.CheckListHeader}>Custom fields</h1>
                                    <FontAwesomeIcon
                                      onClick={() => onCustomFieldMenuClosed()}
                                      className={Styles.XmarkIcon}
                                      icon={faXmark}
                                    />
                                  </Flex>
                                  <label htmlFor="Name">Title</label>
                                  <Flex flexDirection={'column'} gap={2}>
                                    <input
                                      onChange={e => SetTitle(e.target.value)}
                                      className={Styles.InputCheck}
                                      name="title"
                                      type="text"
                                      placeholder='Add a title ... '
                                    />
                                    <select
                                      className={Styles.SellectOption}
                                      name="fieldType"
                                      value={fieldType}
                                      onChange={handleSelectChange}
                                    >
                                      <option value="">Select a field type...</option>
                                      <option value="number">Text</option>
                                      <option value="checkbox">Checkbox</option>
                                      <option value="Dropdown">Dropdown</option>
                                    </select>
                                    {fieldType === 'number' && (
                                      <input
                                        onChange={e => setNumber(e.target.value)}
                                        className={Styles.InputCheck}
                                        name="number" // Ensure the name attribute matches the field name in the DTO
                                        type="text" // Use type="text" to avoid conversion issues
                                        placeholder='Enter Text ... '
                                      />
                                    )}
                                    {fieldType === 'Dropdown' && (
                                      <>
                                        <p>Options</p>
                                        {dropdownOptionsList.map((option, index) => (
                                          <Flex key={index} alignItems={'center'} justifyContent={'space-between'}>
                                            <div className={Styles.ColorOption} style={{ backgroundColor: option.color }}></div>
                                            <p style={{ margin: "0" }}>{option.optionName}</p>
                                            <span
                                              style={{ color: '#9fadbc', fontSize: "20px", cursor: "pointer" }}
                                              className="material-symbols-outlined"
                                              onClick={() => handleDeleteOption(index)}
                                            >
                                              delete
                                            </span>
                                          </Flex>
                                        ))}
                                        <Flex gap={2} alignItems={'center'}>
                                          <Popover isOpen={isColorSelectOpen} onOpen={onColorSelectOpen} onClose={onColorSelectClose}>
                                            <PopoverTrigger>
                                              <div onClick={onColorSelectOpen} className={Styles.ColorOption} style={{ backgroundColor: newOptionColor || '#9fadbc', width: '50px', minHeight: '100%' }}></div>
                                            </PopoverTrigger>
                                            <PopoverContent color='#9fadbc' backgroundColor="#22272B">
                                              <PopoverHeader>Select Color</PopoverHeader>
                                              <PopoverBody>
                                                <Flex gap={2} flexWrap={'wrap'} justifyContent={'space-between'}>
                                                  {ColorArr.map((color, key) => (
                                                    <Button key={key} onClick={() => handleColorSelect(color)} style={{ backgroundColor: color, margin: '0 5px', padding: '20px' }}>
                                                    </Button>
                                                  ))}
                                                </Flex>
                                              </PopoverBody>
                                            </PopoverContent>
                                          </Popover>
                                          <input
                                            style={{ width: "100%" }}
                                            className={Styles.InputCheck}
                                            name="optionName"
                                            type="text"
                                            placeholder='Add item ... '
                                            value={newOptionName}
                                            onChange={e => setNewOptionName(e.target.value)}
                                            disabled={!title} // Disable if title is not set
                                          />
                                          <button
                                            style={{ margin: "0" }}
                                            onClick={handleAddOption}
                                            disabled={!title} // Disable if title is not set
                                          >
                                            Add
                                          </button>
                                        </Flex>
                                        <p style={{ color: "#E4F500", margin: 0 }}>Title is requred</p>
                                      </>
                                    )}
                                  </Flex>
                                  {fieldType === 'Dropdown' ?
                                    <button
                                      type="submit"
                                      onClick={() => {
                                        CreateCustomDropdown.handleSubmit();
                                        CreateCustomField.setFieldValue("cardId", selectedTask?.id);
                                      }}
                                    >
                                      Create
                                    </button>
                                    :
                                    <button
                                      type="submit"
                                      onClick={() => {
                                        CreateCustomField.handleSubmit();
                                        CreateCustomField.setFieldValue("cardId", selectedTask?.id);
                                      }}
                                    >
                                      Create
                                    </button>}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>
                          <h1 style={{ marginTop: "50px" }} className={Styles.MenuTitle}>Actions</h1>
                          <div onClick={() => openRemoveCardModal(selectedTask?.id)} className={Styles.OptionSellectButton}>Remove Card</div>

                          <Modal isOpen={isModalDeletModalOpen} onClose={onCloseModalDeletModal}>
                            <ModalOverlay />
                            <ModalContent color='#9fadbc' backgroundColor="#22272B">
                              <ModalHeader>Delete Card</ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>Are you sure you want to delete this card?</ModalBody>
                              <ModalFooter>
                                <Button colorScheme='red' mr={3} onClick={() => confirmDelete(selectedTask.id)}>
                                  Delete
                                </Button>
                                <Button onClick={onCloseModalDeletModal}>Cancel</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                          <div onClick={() => onOpenArchiveModal()} className={Styles.OptionSellectButton}>Archive Card</div>
                          <Modal isOpen={isArchiveModalOpen} onClose={onCloseArchiveModal}>
                            <ModalOverlay />
                            <ModalContent color='#9fadbc' backgroundColor="#22272B">
                              <ModalHeader>archive Card</ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>Are you sure you want to archive this card?</ModalBody>
                              <ModalFooter>
                                <Button colorScheme='gray' mr={3} onClick={() => { ArchiveFormik.setFieldValue('cardId', selectedTask.id); ArchiveFormik.setFieldValue('isArchived', true); ArchiveFormik.handleSubmit() }}>
                                  archive
                                </Button>
                                <Button onClick={onCloseArchiveModal}>cancel</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                        </div>
                      </Flex>

                    </ModalBody>
                  </ModalContent>
                </Modal>
              </ChakraProvider>
            )}
          </div>
        )
        }
      </Draggable >
    </div >
  );
};

export default Column;
