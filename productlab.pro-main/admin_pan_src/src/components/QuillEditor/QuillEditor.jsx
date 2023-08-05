import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import axios from 'axios';

import htmlEditButton from "quill-html-edit-button";
import ImageUploader from 'quill-image-uploader';
import BlotFormatter, { IframeVideoSpec } from 'quill-blot-formatter';

import CustomImage from './QuillImage';
import CustomVideo from './QuillVideo';

import { API_URL } from '../../api/api';

import { CustomImageSpec } from './QuillBlotScrollFix';
import './Quill.css';

Quill.register('modules/htmlEditButton', htmlEditButton, true);
Quill.register('modules/blotFormatter', BlotFormatter, true);
Quill.register('modules/imageUploader', ImageUploader, true);

Quill.register('formats/image', CustomImage, true);
Quill.register('formats/video', CustomVideo, true);

const modules = {
    toolbar: {
        container: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    },
    htmlEditButton: {
        msg: "Правка контента в виде HTML-кода"
    },
    blotFormatter: {
        specs: [CustomImageSpec, IframeVideoSpec]
    },
    imageUploader: {
        upload: (file) => {
            return new Promise((resolve, reject) => {
                var formData = new FormData();
                formData.append('upload_file', file);

                axios.post(`${API_URL}/api/files/upload`, formData)
                    .then(response => {
                        resolve(`${API_URL}/${response.data.link}`)
                    })
                    .catch(error => {
                        reject("Upload failed");
                    });
            })
        }

    },
}

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    "height", "width", "class", "style"
]

const QuillEditor = React.forwardRef((props, ref) => (
    <ReactQuill
        theme="snow"
        ref={ref}
        modules={modules}
        formats={formats}
        style={{ backgroundColor: "#fff", height: "auto" }}
    />
));


export { QuillEditor };