import React from "react";
import axios from "axios";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Table, message, Popconfirm, Tag, Input, Space } from "antd";
import { FileForm, DebounceSelect } from "../../components";

import { API_URL } from "../../api/api";

class FilesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      count: 0,
      pages: 0,
      loaded: false,
      page: 0,
      size: 10,
      tags: [],
      description: "",
    };
  }

  remove_file = (rec) => {
    axios({
      url: `${API_URL}/api/files/${rec.id}`,
      method: "delete",
      headers: {
        token: this.props.token,
      },
    }).then((response) => {
      message.success("Файл удалён");
      this.fetch(this.state.page + 1, this.state.size);
    });
  };

  fetchTags = (name) => {
    return axios({
      url: `${API_URL}/api/files/tag`,
      method: "get",
      params: {
        name: name,
      },
    })
      .then((response) => {
        return response.data.items.map((tag) => ({
          label: `${tag.name}`,
          value: tag.id,
        }));
      })
      .catch((error) => []);
  };

  columns = () => [
    { title: "Id", dataIndex: "id", key: "id" },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text, rec) =>
        rec.is_deleted ? (
          text
        ) : (
          <a href={rec.link} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Space>
            <Input
              value={this.state.description}
              onChange={(e) => {
                this.setState({ description: e.target.value });
              }}
            />
            <SearchOutlined
              onClick={() => {
                this.fetch(1, this.state.size);
              }}
            />
          </Space>
        </div>
      ),
    },
    {
      title: "Тэги",
      key: "tags",
      dataIndex: "tags",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Space>
            <DebounceSelect
              mode="multiple"
              placeholder="Выберите тэги"
              fetchOptions={this.fetchTags}
              removeIcon={null}
              allowClear={true}
              value={this.state.tags}
              onChange={(val) => this.setState({ ...this.state, tags: val })}
              style={{ width: "180px" }}
            />
            <SearchOutlined
              onClick={() => {
                this.fetch(1, this.state.size);
              }}
            />
          </Space>
        </div>
      ),
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = tag.name.length > 5 ? "geekblue" : "green";
            return (
              <Tag color={color} key={tag.id}>
                {tag.name.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    { title: "Тип", dataIndex: "type", key: "type" },
    {
      title: "Размер",
      dataIndex: "file_size",
      key: "file_size",
      render: (val) => Math.floor(val),
    },
    {
      title: "Создан",
      dataIndex: "created_at",
      key: "created_at",
      render: (val) => (val ? new Date(val).toLocaleString("ru-ru") : null),
    },
    {
      title: "Удалить",
      dataIndex: "id",
      key: "id",
      render: (val, rec) =>
        rec.is_deleted ? null : (
          <Popconfirm
            title={`Вы уверены, что хотите удалить файл "${rec.name}"?`}
            placement="topLeft"
            onConfirm={() => this.remove_file(rec)}
            onCancel={() => message.info("Удаление отменено")}
          >
            <DeleteOutlined />
          </Popconfirm>
        ),
    },
  ];

  fetch = (page, size) => {
    this.setState((state) => ({ ...state, page: page - 1, loaded: false }));
    let url = `${API_URL}/api/files/`;
    if (this.state.tags?.length) {
      for (var i = 0; i < this.state.tags.length; i++) {
        if (i === 0) {
          url = url + `?tags=${this.state.tags[i].value}`;
        } else {
          url = url + `&tags=${this.state.tags[i].value}`;
        }
      }
    }
    if (this.props.category) {
      if (url[-1] === "/") {
        url = url + `?category=${this.props.category}`;
      } else {
        url = url + `?category=${this.props.category}`;
      }
    }
    axios({
      url: url,
      method: "get",
      params: {
        limit: size,
        page: page,
        description: this.state.description,
      },
      headers: {
        token: this.props.token,
      },
    }).then((response) => {
      this.setState((state) => ({
        ...state,
        ...response.data,
        page: page - 1,
        loaded: true,
      }));
    });
  };

  componentDidMount() {
    this.fetch(1, this.state.size);
  }

  table_change = (pag) => {
    this.setState((state) => ({ ...state, size: pag.pageSize }));
    this.fetch(pag.current, pag.pageSize);
  };

  render() {
    return (
      <div>
        <FileForm
          token={this.props.token}
          fetchFiles={this.fetch}
          pageSize={this.state.size}
        />
        {this.state.loaded ? (
          <Table
            columns={this.columns()}
            dataSource={this.state.files}
            rowKey={(rec) => rec.id}
            pagination={{
              current: this.state.page + 1,
              pageSize: this.state.size,
              total: this.state.count,
            }}
            style={{ marginTop: 16 }}
            onChange={(pag, val) => this.table_change(pag)}
          />
        ) : null}
      </div>
    );
  }
}

export { FilesPage };
