import axios from "axios";

export const API_URL = process.env.REACT_APP_SITE_URL;

export const getUser = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/user/${token}`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUsers = async (limit, offset) => {
  try {
    const response = await axios.get(`${API_URL}/api/users`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getArticle = async (options) => {
  try {
    const response = await axios.get(`${API_URL}/api/article`, {
      params: options,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getArticleByCategoryId = async (category_id, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/article?categories_ids=${category_id}&show_unpublic=true`,
      {},
      {
        headers: {
          token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCategories = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/category${token ? `?token=${token}` : ""}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSurveys = async (token, category_ids) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/surveys/${
        category_ids ? `?category_ids=${category_ids}` : ""
      }`,
      {
        headers: {
          token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSurveysBySid = async (sid) => {
  try {
    const response = await axios.get(`${API_URL}/api/surveys/${sid}`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postNewSurvey = async (
  module_id,
  lesson_id,
  name,
  description,
  token,
  data
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/surveys/new_survey${
        module_id ? `?module_id=${module_id}` : ""
      }${lesson_id ? `&lesson_id=${lesson_id}` : ""}${
        name ? `&name=${name}` : ""
      }${description ? `&description=${description}` : ""}`,
      data,
      {
        headers: {
          token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postUpdateSurvay = async (sid, name, description, data) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/surveys/${sid}${name ? `?name=${name}` : ""}${
        description ? `&description=${description}` : ""
      }`,
      data
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postAnswerSurvay = async (sid, aid, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/surveys/answer/${sid}?aid=${aid}`,
      {},
      {
        headers: {
          token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserAnswers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/surveys/user_answers`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllUserTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/tag_for_user`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllUserCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/category_for_user`);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postUpdateUser = async (user_id, token, data) => {
  try {
    const response = await axios.patch(`${API_URL}/api/user/${user_id}`, data, {
      headers: {
        token,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postSendingToUsersRoute = async (data, token) => {
  try {
    const response = await axios.patch(`${API_URL}/api/users/sending`, data, {
      headers: {
        token,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
