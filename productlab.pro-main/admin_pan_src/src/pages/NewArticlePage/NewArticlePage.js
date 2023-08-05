import React, { Component } from "react";
import {
  Button,
  Modal,
  InputNumber,
  Radio,
  Image,
  Select,
  Upload,
  Input,
  Space,
  Form,
  Popover,
  Card,
  Avatar,
  message,
} from "antd";

import no_image from "../../images/no_main.png";
import { Link } from "react-router-dom";

import axios from "axios";

import { DebounceSelect, QuillEditor } from "../../components";
import Lottie from "react-lottie";
import { API_URL } from "../../api/api";

const { Meta } = Card;

const tailLayout = {
  wrapperCol: {
    offset: 18,
    span: 15,
  },
};

const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 19,
  },
};

const ru_roles = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  COPYWRITER: "Копирайтер",
};

class NewArticlePage extends Component {
  constructor(props) {
    super(props);

    this.formRef = React.createRef();
    this.quillRef = React.createRef();

    this.state = {
      params: {},
      loaded: false,
      loaded_tablecrm: false,
      previewMainOpen: false,
      previewHeaderOpen: false,
      chosen_proj: 0,
      chosen_cont: 0,
      user: false,
    };
  }

  // setFormRef = (ref) => {
  //     this.formRef = ref;
  //     this.formRef.setFieldsValue({
  //         fetch_client_tablecrm: { label: "Не указывать", value: 0 },
  //         fetch_project_tablecrm: { label: "Не указывать", value: 0 },
  //     })
  // };

  // setQuillRef = (ref) => {
  //     this.quillRef = ref;
  // }

  onUnload = (e) => {
    // the method that will be used for both add and remove event
    e.preventDefault();
    e.returnValue = "Вы уверены что хотите закрыть страницу?";
  };

  componentDidMount() {
    axios.get(`${API_URL}/api/user/${this.props.token}`).then((response) => {
      if (response.status === 200) {
        this.setState({ user: response.data });

        const formData = new FormData();
        formData.append("owner", response.data.id);
        formData.append("price_hour", 1);
        formData.append("tags", []);
        formData.append("category", []);
        axios
          .post(`${API_URL}/api/article`, formData, {
            headers: {
              token: this.props.token,
            },
          })
          .then((response_create) => {
            axios
              .get(`${API_URL}/api/article/${response_create.data.id}`)
              .then((response_get) => {
                axios
                  .get(`${API_URL}/api/users`, {
                    headers: {
                      token: this.props.token,
                    },
                  })
                  .then((resp_users) => {
                    let users_select = [];
                    users_select.push({ label: "Не указывать", value: 0 });
                    for (var x in resp_users.data.result) {
                      users_select.push({
                        label: resp_users.data.result[x].name,
                        value: resp_users.data.result[x].id,
                      });
                    }
                    this.setState({
                      article: response_get.data,
                      users: resp_users.data.result,
                      new_performer: response_get.data.performer,
                      users_select: users_select,
                      loaded: true,
                      chosen_cont: response_get.data.client_tablecrm_id
                        ? response_get.data.client_tablecrm_id
                        : 0,
                      chosen_proj: response_get.data.project_tablecrm_id
                        ? response_get.data.project_tablecrm_id
                        : 0,
                    });
                  });
              });
          });
      }
    });
    // this.fetchUser()
    window.addEventListener("beforeunload", this.onUnload);

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    this.setState({
      params: params,
    });

    axios.get(`${API_URL}/api/token_tablecrm`).then((resp) => {
      this.setState({ tableToken: resp.data, loaded_tablecrm: true });
      // axios.get(`https://tablecrm.com/api/v1/contragents?token=${resp.data}`).then(conts => {
      //     axios.get(`https://tablecrm.com/api/v1/projects?token=${resp.data}`).then(projects => {
      //         let conts_select = []
      //         let proj_select = []

      //         conts_select.push({ label: "Не указывать", value: 0 })
      //         proj_select.push({ label: "Не указывать", value: 0 })

      //         for (var x in conts.data.result) {
      //             conts_select.push({ label: conts.data.result[x].name, value: conts.data.result[x].id })
      //         }

      //         for (var y in projects.data.result) {
      //             proj_select.push({ label: projects.data.result[y].name, value: projects.data.result[y].id })
      //         }

      //         this.setState({
      //             conts_tcrm: conts_select,
      //             proj_tcrm: proj_select,
      //             loaded_tablecrm: true,
      //         })
      //     })
      // })
    });

    // setTimeout(() => {
    //     this.quillRef.current.editor.root.innerHTML = this.state.article.content;
    //     this.formRef.current.setFieldsValue({
    //         fetch_client_tablecrm: [{ label: "Не указывать", value: 0 }],
    //         fetch_project_tablecrm: [{ label: "Не указывать", value: 0 }],
    //     })

    // }, 500);
  }

  getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  getFileContent = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
  };

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");

      if (file.type === "application/json") {
        this.setState({
          new_main_pic: file,
          is_preview_lottie: true,
        });
      } else {
        this.setState({
          new_main_pic: file,
          is_preview_lottie: false,
        });
      }
    }, 0);
  };

  handlePreview = () => {
    if (!this.state.is_preview_lottie) {
      if (!this.state.new_main_pic.url && !this.state.new_main_pic.preview) {
        this.getBase64(this.state.new_main_pic).then((resp) => {
          this.setState({
            previewMainOpen: true,
            previewImage: resp,
          });
        });
      }
    } else {
      this.getFileContent(this.state.new_main_pic).then((resp) => {
        this.setState({
          previewMainOpen: true,
          previewImage: JSON.parse(resp),
        });
      });
    }
  };

  handleCancelPr = () => {
    this.setState({
      previewMainOpen: false,
    });
  };

  dummyRequestHeader = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");

      if (file.type === "application/json") {
        this.setState({
          new_header_pic: file,
          is_preview_header_lottie: true,
        });
      } else {
        this.setState({
          new_header_pic: file,
          is_preview_header_lottie: false,
        });
      }
    }, 0);
  };

  handlePreviewHeader = () => {
    if (!this.state.is_preview_header_lottie) {
      if (
        !this.state.new_header_pic.url &&
        !this.state.new_header_pic.preview
      ) {
        this.getBase64(this.state.new_header_pic).then((resp) => {
          this.setState({
            previewHeaderOpen: true,
            previewHeaderImage: resp,
          });
        });
      }
    } else {
      this.getFileContent(this.state.new_header_pic).then((resp) => {
        this.setState({
          previewHeaderOpen: true,
          previewHeaderImage: JSON.parse(resp),
        });
      });
    }
  };

  handleCancelPrHeader = () => {
    this.setState({
      previewHeaderOpen: false,
    });
  };

  onFinish = (values) => {
    window.removeEventListener("beforeunload", this.onUnload);

    let content = this.quillRef.current;

    const formData = new FormData();

    if (values.fetch_project_tablecrm) {
      if (values.fetch_project_tablecrm.length !== 0) {
        formData.append(
          "project_tablecrm",
          values.fetch_project_tablecrm[0].label
        );
        formData.append(
          "project_tablecrm_id",
          values.fetch_project_tablecrm[0].value
        );
      }
    }

    if (values.fetch_client_tablecrm) {
      if (values.fetch_client_tablecrm.length !== 0) {
        formData.append(
          "client_tablecrm",
          values.fetch_client_tablecrm[0].label
        );
        formData.append(
          "client_tablecrm_id",
          values.fetch_client_tablecrm[0].value
        );
      }
    }

    if (this.state.new_performer) {
      formData.append("performer", this.state.new_performer.id);
    }

    formData.append("isPublish", values.isPublish);
    // formData.append("seo_url", null);
    formData.append("first_sentence", values.first_sentence);
    formData.append("isPublic", values.isPublic);
    formData.append("title", values.title);
    formData.append("content", content.editor.root.innerHTML);
    formData.append("price_hour", values.price_hour);

    if (values.fetch_tags && values.fetch_tags.length !== 0) {
      for (var i = 0; i < values.fetch_tags.length; i++) {
        if (values.fetch_tags[i].title === "new") {
          formData.append("tags", `newtag_${values.fetch_tags[i].value}`);
        } else {
          formData.append("tags", values.fetch_tags[i].value);
        }
      }
      // formData.append("tags", `${values.fetch_tags.map((tag) => tag.value)}`);
    } else {
      formData.append("tags", []);
    }

    if (values.fetch_cats && values.fetch_cats.length !== 0) {
      for (var j = 0; j < values.fetch_cats.length; j++) {
        if (values.fetch_cats[j].title === "new") {
          formData.append(
            "category",
            `newcategory_${values.fetch_cats[j].value}`
          );
        } else {
          formData.append("category", values.fetch_cats[j].value);
        }
      }
    } else {
      formData.append("category", []);
    }

    if (this.state.new_main_pic) {
      formData.append("main_image", this.state.new_main_pic);
    }

    if (this.state.new_header_pic) {
      formData.append("header_image", this.state.new_header_pic);
    }

    axios
      .patch(`${API_URL}/api/article/${this.state.article.id}`, formData, {
        headers: {
          token: this.state.params.token,
        },
      })
      .then((response) => {
        this.setState({ article_saved: true });
        message.success("Статья успешно сохранена");
        setTimeout(() => {
          window.location.replace(`/?token=${this.state.params.token}`);
        }, 1000);
      })
      .catch((error) => message.error(`Ошибка ${error.response.status}`));
  };

  fetchUserList = async (username) => {
    if (username) {
      return fetch(
        `https://app.tablecrm.com/api/v1/contragents?token=${this.state.tableToken}&name=${username}`
      )
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.result.map((user) => ({
            label: `${user.name}`,
            value: user.id,
          }))
        )
        .then((body) => {
          return body;
        });
    } else {
      return fetch(
        `https://app.tablecrm.com/api/v1/contragents?token=${this.state.tableToken}`
      )
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.result.map((user) => ({
            label: `${user.name}`,
            value: user.id,
          }))
        )
        .then((body) => {
          return body;
        });
    }
  };

  fetchProjectsList = async (project) => {
    if (project) {
      return fetch(
        `https://app.tablecrm.com/api/v1/projects?token=${this.state.tableToken}&name=${project}`
      )
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.result.map((user) => ({
            label: `${user.name}`,
            value: user.id,
          }))
        )
        .then((body) => {
          return body;
        });
    } else {
      return fetch(
        `https://app.tablecrm.com/api/v1/projects?token=${this.state.tableToken}`
      )
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.result.map((user) => ({
            label: `${user.name}`,
            value: user.id,
          }))
        )
        .then((body) => {
          return body;
        });
    }
  };

  fetchTags = async (tags) => {
    if (tags) {
      return fetch(`${API_URL}/api/tag?name=${tags}`, {
        headers: {
          token: this.state.params.token,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.items.map((tag) => ({
            label: `${tag.name}`,
            value: tag.id,
          }))
        )
        .then((body) => {
          return body;
        });
    } else {
      return fetch(`${API_URL}/api/tag`, {
        headers: {
          token: this.state.params.token,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body.items.map((tag) => ({
            label: `${tag.name}`,
            value: tag.id,
          }))
        )
        .then((body) => {
          return body;
        });
    }
  };

  fetchCats = async (cats) => {
    if (cats) {
      return fetch(`${API_URL}/api/category?name=${cats}`, {
        headers: {
          token: this.state.params.token,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body
            .filter((cat) => cat.id !== 0)
            .map((cat) => ({
              label: `${cat.name}`,
              value: cat.id,
            }))
        )
        .then((body) => {
          return body;
        });
    } else {
      return fetch(`${API_URL}/api/category`, {
        headers: {
          token: this.state.params.token,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          return body;
        })
        .then((body) =>
          body
            .filter((cat) => cat.id !== 0)
            .map((cat) => ({
              label: `${cat.name}`,
              value: cat.id,
            }))
        )
        .then((body) => {
          return body;
        });
    }
  };

  render() {
    return (
      <>
        {this.state.article ? (
          <Form
            name="validate_other"
            ref={this.formRef}
            disabled={this.state.article_saved}
            {...formItemLayout}
            onFinish={this.onFinish}
            initialValues={this.state.article}
          >
            <Form.Item label="Ссылка на статью">
              <Space direction="horizontal">
                <Input
                  style={{ width: 750 }}
                  value={`https://productlab.pro/article/${this.state.article.id}`}
                />

                <Popover
                  content="Ссылка скопирована в буфер обмена"
                  trigger="click"
                >
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `https://productlab.pro/article/${this.state.article.id}`
                      )
                    }
                  >
                    Скопировать
                  </Button>
                </Popover>
              </Space>
            </Form.Item>

            <Form.Item label="Статью написал">
              <Meta
                avatar={
                  <Avatar
                    src={`${API_URL}/api/${this.state.article.owner.profile_pic}`}
                  />
                }
                title={
                  <>
                    {this.state.article.owner.name} -{" "}
                    <b>{ru_roles[this.state.article.owner.role]}</b>
                  </>
                }
              />
            </Form.Item>

            <Form.Item label="Исполнитель">
              <Space direction="horizontal">
                <Select
                  defaultValue={
                    this.state.article.performer
                      ? this.state.article.performer.id
                      : 0
                  }
                  style={{
                    width: 250,
                  }}
                  onChange={(id) => {
                    const users = [...this.state.users];
                    let finded_user = users.find(
                      (element) => element.id === id
                    );
                    this.setState({
                      new_performer: finded_user,
                    });
                  }}
                  options={this.state.users_select}
                />
                {this.state.new_performer ? (
                  <Meta
                    avatar={
                      <Avatar
                        src={`${API_URL}/api/${this.state.new_performer.profile_pic}`}
                      />
                    }
                    title={
                      <>
                        {this.state.new_performer.name} -{" "}
                        <b>{ru_roles[this.state.new_performer.role]}</b>
                      </>
                    }
                  />
                ) : (
                  <Meta avatar={<Avatar />} title={<>Не указан</>} />
                )}
              </Space>
            </Form.Item>

            <Form.Item
              name="title"
              label="Название статьи"
              rules={[
                {
                  required: true,
                  message: "Название статьи обязательно!",
                },
              ]}
            >
              <Input placeholder="Введите название статьи" />
            </Form.Item>
            <Form.Item
              name="first_sentence"
              label="Первое предложение"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Первое предложение статьи обязательно!",
                },
              ]}
            >
              <Input placeholder="Введите первое предложение статьи" />
            </Form.Item>

            <Form.Item label="Клиент" name="fetch_client_tablecrm">
              <DebounceSelect
                mode="multiple"
                service="tablecrm"
                placeholder="Выберите клиента"
                fetchOptions={this.fetchUserList}
                removeIcon={null}
                onChange={(newValue) => {
                  if (newValue.length <= 1) {
                    this.formRef.current.setFieldsValue({
                      fetch_client_tablecrm: newValue,
                    });
                  } else {
                    this.formRef.current.setFieldsValue({
                      fetch_client_tablecrm: newValue.slice(-1),
                    });
                  }
                }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item label="Проект" name="fetch_project_tablecrm">
              <DebounceSelect
                mode="multiple"
                service="tablecrm"
                placeholder="Выберите проекта"
                fetchOptions={this.fetchProjectsList}
                removeIcon={null}
                onChange={(newValue) => {
                  if (newValue.length <= 1) {
                    this.formRef.current.setFieldsValue({
                      fetch_project_tablecrm: newValue,
                    });
                  } else {
                    this.formRef.current.setFieldsValue({
                      fetch_project_tablecrm: newValue.slice(-1),
                    });
                  }
                }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item label="Теги" name="fetch_tags">
              <DebounceSelect
                mode="multiple"
                service="productlab"
                placeholder="Выберите теги"
                fetchOptions={this.fetchTags}
                removeIcon={null}
                onChange={(newValue) => {
                  this.formRef.current.setFieldsValue({
                    fetch_tags: newValue,
                  });
                }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item label="Категории" name="fetch_cats">
              <DebounceSelect
                mode="multiple"
                service="productlab"
                placeholder="Выберите категории"
                fetchOptions={this.fetchCats}
                removeIcon={null}
                onChange={(newValue) => {
                  this.formRef.current.setFieldsValue({
                    fetch_cats: newValue,
                  });
                }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item name="raw_content" label="Контент" hasFeedback>
              <QuillEditor ref={this.quillRef} />
            </Form.Item>

            <Form.Item
              name="isPublic"
              label="Тип статьи"
              rules={[
                {
                  required: true,
                  message: "Please pick an item!",
                },
              ]}
            >
              <Radio.Group>
                <Radio.Button value={true}>Публичная</Radio.Button>
                <Radio.Button value={false}>Непубличная</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="isPublish"
              label="Статус"
              rules={[
                {
                  required: true,
                  message: "Please pick an item!",
                },
              ]}
            >
              <Radio.Group>
                <Radio.Button value={true}>Опубликована</Radio.Button>
                <Radio.Button value={false}>Не опубликована</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Стоимость реализации проекта"
              name="price_hour"
              rules={[
                {
                  required: true,
                  message: "Стоимость реализации обязательна!",
                },
              ]}
            >
              <InputNumber min={1} addonAfter="час(ов)" />
            </Form.Item>

            <Form.Item label="Основная картинка">
              <Form.Item getValueFromEvent={this.normFile} noStyle>
                <Space direction="horizontal">
                  {this.state.is_main_lottie ? (
                    <Lottie
                      width={100}
                      height={100}
                      options={{
                        rendererSettings: {
                          preserveAspectRatio: "xMidYMid slice",
                        },
                        loop: true,
                        path: this.state.main_lottie_url,
                      }}
                    />
                  ) : (
                    <Image
                      width={100}
                      // src={`${API_URL}/api/${this.state.article.main_pic ? this.state.article.main_pic : no_image}`}
                      src={
                        this.state.article.main_pic
                          ? `${API_URL}/api/${this.state.article.main_pic}`
                          : no_image
                      }
                    />
                  )}
                  <Upload
                    onPreview={this.handlePreview}
                    previewFile={(file) =>
                      new Promise((resolve, reject) => {
                        if (file.type.split("/").at(0) === "image") {
                          this.getBase64(file).then((res) => resolve(res));
                        } else {
                          this.getFileContent(file).then((res) => {
                            resolve(res);
                          });
                        }
                      })
                    }
                    listType="picture-card"
                    name="files"
                    customRequest={this.dummyRequest}
                    accept=".jpg, .jpeg, .png, .svg, .gif, .json"
                    maxCount={1}
                  >
                    Загрузить...
                  </Upload>
                </Space>
                <Modal
                  open={this.state.previewMainOpen}
                  title={"Новое изображение"}
                  footer={null}
                  onCancel={this.handleCancelPr}
                >
                  {this.state.is_preview_lottie ? (
                    <Lottie
                      width={400}
                      height={400}
                      options={{
                        loop: true,
                        rendererSettings: {
                          preserveAspectRatio: "xMidYMid slice",
                        },
                        autoplay: true,
                        animationData: this.state.previewImage,
                      }}
                    />
                  ) : (
                    <img
                      alt="example"
                      style={{
                        width: "100%",
                      }}
                      src={this.state.previewImage}
                    />
                  )}
                </Modal>
              </Form.Item>
            </Form.Item>

            <Form.Item label="Картинка в шапке страницы">
              <Form.Item getValueFromEvent={this.normFile} noStyle>
                {/* <Space direction='horizontal'>
                                    <Image
                                        width={100}
                                        // src={`${API_URL}/api/${this.state.article.header_pic ? this.state.article.header_pic: no_image}`}
                                        src={this.state.article.header_pic ? `${API_URL}/api/${this.state.article.header_pic}` : no_image}
                                    />
                                    <Upload onPreview={this.handlePreviewHeader} listType="picture-card" name="files" customRequest={this.dummyRequestHeader} accept=".jpg, .jpeg, .png, .svg, .gif, .json" maxCount={1}>
                                        Загрузить...
                                    </Upload>
                                </Space>
                                <Modal open={this.state.previewHeaderOpen} title={"Новое изображение"} footer={null} onCancel={this.handleCancelPrHeader}>
                                    <img
                                        alt="example"
                                        style={{
                                            width: '100%',
                                        }}
                                        src={this.state.previewHeaderImage}
                                    />
                                </Modal> */}
                <Space direction="horizontal">
                  {this.state.is_header_lottie ? (
                    <Lottie
                      width={100}
                      height={100}
                      options={{
                        rendererSettings: {
                          preserveAspectRatio: "xMidYMid slice",
                        },
                        loop: true,
                        path: this.state.header_lottie_url,
                      }}
                    />
                  ) : (
                    <Image
                      width={100}
                      // src={`${API_URL}/api/${this.state.article.header_pic ? this.state.article.header_pic: no_image}`}
                      src={
                        this.state.article.header_pic
                          ? `${API_URL}/api/${this.state.article.header_pic}`
                          : no_image
                      }
                    />
                  )}
                  <Upload
                    onPreview={this.handlePreviewHeader}
                    previewFile={(file) =>
                      new Promise((resolve, reject) => {
                        if (file.type.split("/").at(0) === "image") {
                          this.getBase64(file).then((res) => resolve(res));
                        } else {
                          this.getFileContent(file).then((res) => {
                            resolve(res);
                          });
                        }
                      })
                    }
                    listType="picture-card"
                    name="files"
                    customRequest={this.dummyRequestHeader}
                    accept=".jpg, .jpeg, .png, .svg, .gif, .json"
                    maxCount={1}
                  >
                    Загрузить...
                  </Upload>
                </Space>
                <Modal
                  open={this.state.previewHeaderOpen}
                  title={"Новое изображение"}
                  footer={null}
                  onCancel={this.handleCancelPrHeader}
                >
                  {this.state.is_preview_header_lottie ? (
                    <Lottie
                      width={400}
                      height={400}
                      options={{
                        loop: true,
                        rendererSettings: {
                          preserveAspectRatio: "xMidYMid slice",
                        },
                        autoplay: true,
                        animationData: this.state.previewHeaderImage,
                      }}
                    />
                  ) : (
                    <img
                      alt="example"
                      style={{
                        width: "100%",
                      }}
                      src={this.state.previewHeaderImage}
                    />
                  )}
                </Modal>
              </Form.Item>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 5 }}
              >
                Подтвердить
              </Button>
              <Link to={`/?token=${this.state.params.token}`}>
                <Button htmlType="button">Отмена</Button>
              </Link>
            </Form.Item>
          </Form>
        ) : null}
      </>
    );
  }
}

export { NewArticlePage };
