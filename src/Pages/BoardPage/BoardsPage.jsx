import React, { useState } from 'react'
import Styles from './BoardsPage.module.scss'
import SideBarMenu from '../../Components/SideBarMenu/SideBarMenu'
import Content from './BoardsPageComponents/Content'
import { useLocation, useParams } from 'react-router'

export default function BoardsPage() {
  const location = useLocation();
  const { id } = useParams();
  const [image, setImage] = useState()
  const hangeChangeImage = (image) => {
    setImage(image)
    console.log(image);
  }
  return (
    <>
      <div
        style={{
          backgroundImage: `url(/Images/${image}.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: "100hv"
        }}
        className={Styles.MainContainer}>
        <SideBarMenu setImage={hangeChangeImage} id={id} />
        <Content  />
      </div>
    </>
  )
}
