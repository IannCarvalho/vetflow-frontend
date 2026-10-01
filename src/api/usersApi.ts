import axios from './axios';

interface UpdateProfileData {
  name: string;
  email: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface SetPasswordData {
  password: string;
}

export const usersApi = {
  updateProfile: async (data: UpdateProfileData) => {
    try {
      const response = await axios.put('/users/profile', data);
      return response.data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  updateProfilePicture: async (base64: string) => {
    try {
      const response = await axios.put('/users/profile-picture', {
        profile_picture: base64,
      });
      return response.data.user;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  },

  removeProfilePicture: async () => {
    try {
      const response = await axios.delete('/users/profile-picture');
      return response.data.user;
    } catch (error) {
      console.error('Error removing profile picture:', error);
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    try {
      const response = await axios.put('/users/password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  setPassword: async (data: SetPasswordData) => {
    try {
      const response = await axios.put('/users/password/set', data);
      return response.data;
    } catch (error) {
      console.error('Error setting password:', error);
      throw error;
    }
  },
};
