import React, { useEffect, useState } from 'react';
import { Post } from '../types/Post';
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentBlock,
  ContentState,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import Editor from '@draft-js-plugins/editor';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar } from '../cache';
import { Box } from '@mui/material';
import useSavePost from './useSavePost';

const blockStyleFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType();
  if (type === 'unstyled') {
    return 'unstyled-content-block'
  }
  return '';
};

interface EditorComponentProps {
  post: Post;
  isReadonly: boolean;
}
export default function EditorComponent(props: EditorComponentProps) {
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);

  const { savePost } = useSavePost(props.post.id);

  const [saveTimeout, setSaveTimeout] = useState(null as ReturnType<typeof setTimeout> | null);
  const [focused, setFocused] = useState(false);
  const [editorState, setEditorState] = useState(() => {
    if (props.post.draft) {
      const contentState = convertFromRaw(JSON.parse(props.post.draft)) as ContentState;
      return EditorState.createWithContent(contentState);
    }
    else {
      return EditorState.createEmpty();
    }
  });

  const editorRef = React.createRef<Editor>();

  useEffect(() => {
    if (focused && editorRef.current) {
      editorRef.current.focus();
    }
  });

  const handleChange = (newState: EditorState) => {
    if (props.post.userId !== userDetail.user?.id || props.post.commitDate) {
      return;
    }
    setEditorState(newState);

    const contentState = newState.getCurrentContent();
    const draft = JSON.stringify(convertToRaw(contentState));
    if (draft !== props.post.draft) {
      client.cache.modify({
        id: client.cache.identify(props.post),
        fields: {
          draft: () => draft,
        },
      });

      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      const timeout = setTimeout(() => {
        savePost(draft);
        setSaveTimeout(null);
      }, 1000);
      setSaveTimeout(timeout);
    }
  };

  const handlePaste = () => {

  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const isReadonly = props.isReadonly || !!props.post.commitDate || props.post.userId !== userDetail.user?.id;
  return (
    <Box sx={{
      fontSize: 14,
    }}>
      <Editor
        readOnly={isReadonly}
        editorState={editorState}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        spellCheck={true}
        ref={editorRef}
        blockStyleFn={blockStyleFn}
      />
    </Box>
  );
}