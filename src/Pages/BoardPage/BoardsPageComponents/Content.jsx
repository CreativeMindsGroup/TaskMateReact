import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Styles from '../../../Components/SideBarMenu/SideBarMenu.module.css';
import CardList from '../CardList/CardList';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { getBoardById } from '../../../Service/BoardService';
import { Flex } from '@chakra-ui/react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router';

export default function Content() {
    const [filterData, setFilterData] = useState();
    const { BoardId } = useSelector((x) => x.workspaceAndBoard);
const {BoardId:boardId} = useParams()
    const { data: boardData, isLoading, error, isSuccess } = useQuery(
        ["boardData", boardId],
        () => getBoardById(boardId),
        {
            keepPreviousData: true,
            enabled: !!boardId,
            refetchOnWindowFocus: false 
        }
    );
    console.log(boardData);
    const formik = useFormik({
        initialValues: {
            title: '',
            option: '',
        },
        onSubmit: (values) => {
            setFilterData(values);
        },
    });
    const { workspaceId } = useSelector((x) => x.workspaceAndBoard)
    const navigate = useNavigate()
    return (
        <div className={Styles.MainContainer} style={{ overflow: 'hidden' }}>
            <Col lg={12} className={Styles.sideBarMenuTopMenuWrapper}>
                <Container fluid className={[Styles.sideBarMenuTopMenu, "flex-wrap flex-column flex-md-row"]}>
                    <div className='d-flex align-items-center col-8 col-md-6 justify-content-start'>
                        <h5 id='boardName' className={Styles.boardName}>Board : {boardData?.data?.title}</h5>
                        <div id="workspace-privacy-dropdown-wrapper" className={Styles.workspacePrivacyDropdownWrapper}>
                        </div>
                    </div>

                    <div className='d-flex align-items-center col-8 col-md-6 justify-content-start justify-content-md-end'>
                        <div className={Styles.workspacePrivacyDropdownWrapper}>
                            <DropdownButton className={Styles.workspacePrivacyDropdown} title="Filters">
                                <div className={Styles.ContentDropdown}>
                                    <form onSubmit={formik.handleSubmit}>
                                        <Flex alignItems={'center'} justifyContent={"center"}>
                                            <h1 className={Styles.FilterMenuHeader}>
                                                Filter
                                            </h1>
                                        </Flex>
                                        <Flex flexDir={'column'}>
                                            <h1 className={Styles.FilterMenuHeader}>Keyword</h1>
                                            <input
                                                className={Styles.FilterInput}
                                                type="text"
                                                value={formik.values.title}
                                                onChange={formik.handleChange}
                                                name='title'
                                            />
                                            <p className={Styles.FilterDesc}>Search cards, members, labels, and more.</p>
                                        </Flex>
                                        <Flex flexDir={'column'}>
                                            <h1 className={Styles.FilterMenuHeader}>Labels</h1>
                                            <select
                                                style={{ padding: "9px 10px" }}
                                                className={Styles.FilterInput}
                                                value={formik.values.option}
                                                onChange={formik.handleChange}
                                                name='option'
                                            >
                                                <option className={Styles.label} value=""></option>
                                                <option className={Styles.label} value="option1">Option 1</option>
                                                <option className={Styles.label} value="option2">Option 2</option>
                                                <option className={Styles.label} value="option3">Option 3</option>
                                            </select>
                                            <button type='submit' onChange={formik.handleSubmit} className={Styles.FilterButton}>
                                                Filter
                                            </button>
                                        </Flex>
                                    </form>
                                </div>
                            </DropdownButton>
                        </div>
                        <div className={Styles.profilesWrapper}>
                            <Button onClick={() => navigate(`/members/${workspaceId}`)} className={Styles.shareButton}><FontAwesomeIcon icon={faUserPlus} />Share</Button>
                        </div>
                    </div>
                </Container>
            </Col>
            <Col lg={12} >
                <CardList boardData={boardData?.data} />
            </Col>
            <div>
            </div>
        </div>
    )
}
