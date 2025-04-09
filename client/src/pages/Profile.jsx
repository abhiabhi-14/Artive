import React from 'react'
import { Container, Profile as ProfileComponent } from '../components'

const Profile = () => {
  return (
    <Container>
        <ProfileComponent className="md:w-1/2 mx-auto" />
    </Container>
  )
}

export default Profile