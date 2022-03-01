import React, { useEffect, useState } from 'react';
import { Post } from '../../types/Post';
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
import { focusVar, userVar } from '../../cache';
import { Box } from '@mui/material';
import useSavePost from '../useSavePost';
import createIframelyPlugin from './createIframelyPlugin';
import linkifyIt, { LinkifyIt } from 'linkify-it';
import tlds from 'tlds';
import moveSelectionToEnd from './moveSelectionToEnd';

const iframelyPlugin = createIframelyPlugin();

const blockStyleFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType();
  if (type === 'unstyled') {
    return 'unstyled-content-block'
  }
  return '';
};

const linkify: LinkifyIt = linkifyIt().tlds(tlds);

export function extractLinks(text: string): linkifyIt.Match[] | null {
  return linkify.match(text);
}

interface EditorComponentProps {
  post: Post;
  isReadonly: boolean;
}
export default function EditorComponent(props: EditorComponentProps) {
  const client = useApolloClient();
  const userDetail = useReactiveVar(userVar);
  const focusDetail = useReactiveVar(focusVar);

  const { savePost } = useSavePost(props.post.id);

  const [isSaving, setIsSaving] = useState(false);
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
    if (focusDetail.postId === props.post.id && editorRef.current)  {
      setEditorState(moveSelectionToEnd(editorState));
      editorRef.current.focus();
      focusVar({
        postId: '',
      });
    }
  });

  useEffect(() => {
    if (isSaving) {
      setIsSaving(false)
    }
    else if (props.post.draft) {
      const contentState = convertFromRaw(JSON.parse(props.post.draft));
      if (focused) {
        setEditorState(moveSelectionToEnd(EditorState.createWithContent(contentState)));
      }
      else {
        setEditorState(
          EditorState.createWithContent(contentState)
        );
      }
    }
  }, [props.post.draft])

  const handleChange = (newState: EditorState) => {
    if (props.post.userId !== userDetail?.id || props.post.commitDate) {
      return;
    }
    setEditorState(newState);

    const contentState = newState.getCurrentContent();
    const draft = JSON.stringify(convertToRaw(contentState));
    if (draft !== props.post.draft) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      const timeout = setTimeout(() => {
        savePost(draft);
        setSaveTimeout(null);
        setIsSaving(true);
      }, 1000);
      setSaveTimeout(timeout);
    }
  };

  const handlePaste = (text: string, html: string, editorState: EditorState) => {
    const result = extractLinks(text)
    if (result) {
      const newEditorState = iframelyPlugin.addEmbed(editorState, { url: result[0].url });
      handleChange(newEditorState);
      return 'handled';
    }
    return 'not-handled'
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const isReadonly = props.isReadonly || !!props.post.commitDate || props.post.userId !== userDetail?.id;
  return (
    <Box sx={{
      fontSize: 14,
      width: '100%',
      position: 'relative',
    }}>
      <Editor
        readOnly={isReadonly}
        editorState={editorState}
        handlePastedText={handlePaste}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        spellCheck={true}
        ref={editorRef}
        blockStyleFn={blockStyleFn}
        plugins={[iframelyPlugin]}
      />
    </Box>
  );
}