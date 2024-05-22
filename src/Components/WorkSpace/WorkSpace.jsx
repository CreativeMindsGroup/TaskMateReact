import React from 'react'
import { Image } from 'react-bootstrap'
import Styles from './WorkSpace.module.css'
export default function WorkSpace({ WorkspaceTitle,Click }) {
    return (
        <div onClick={Click} className={Styles.main}>
            <div className={Styles.WorkSpaceContainer}>
                <Image
                    className={Styles.WorkspaceImage}
                    src={`https://placehold.co/512x512/d9e3da/1d2125?text=${WorkspaceTitle?.toUpperCase().slice(
                        0,
                        1
                    )}`}
                />
                <p className={Styles.WorkspaceText}>{WorkspaceTitle}</p>
            </div >
        </div>
    )
}
