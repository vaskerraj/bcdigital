import React, { useState, useEffect, useRef } from 'react';

import baseUrl from '../helpers/api';

const Editor = ({ data, onChange, onReady }) => {
    const editorRef = useRef()
    const [editorLoaded, setEditorLoaded] = useState(false)
    const { CKEditor, ClassicEditor } = editorRef.current || {}

    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
            ClassicEditor: require('@ckeditor/ckeditor5-build-classic')
        }
        setEditorLoaded(true)
    }, []);

    return editorLoaded ? (
        <CKEditor
            editor={ClassicEditor}
            data={data}
            config={{
                ckfinder: {
                    uploadUrl: "/../api/product/editor"
                }
            }}
            onReady={(editor) => {
                editor.editing.view.change(writer => {
                    writer.setStyle(
                        "height",
                        "300px",
                        editor.editing.view.document.getRoot()
                    );
                });
            }
            }
            onChange={(event, editor) => onChange(event, editor)}
        />
    ) : (
        <div>loading...</div>
    )
}

export default Editor;
