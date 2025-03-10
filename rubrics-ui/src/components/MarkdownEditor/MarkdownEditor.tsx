import generateNewMarkdownContentPrompt from '@dodao/web-core/components/app/Markdown/generateNewMarkdownContentPrompt';
import { markdownAIRewriteCommandFacotry } from '@dodao/web-core/components/app/Markdown/MarkdownAICommand';
import rewriteMarkdownContentPrompt from '@dodao/web-core/components/app/Markdown/rewriteMarkdownContentPrompt';
import SelectAIGeneratorModal from '@dodao/web-core/components/app/Markdown/SelectAIGeneratorModal';

import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import RobotIconSolid from '@dodao/web-core/components/core/icons/RobotIconSolid';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { SetStateAction, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';
import axios from 'axios';

const defaultGuidelines = `- The output should be in simple language and easy to understand.
- The output should be in your own words and not copied from the content provided.
- The output should be between 4-8 paragraphs.
- Don't create a conclusion or summary paragraph.`;

interface MarkdownEditorProps extends PropsWithChildren {
  id?: string;
  spaceId?: string;
  objectId?: string;
  placeholder?: string;
  modelValue?: string;
  error?: string | boolean;
  editorClass?: string;
  editorStyles?: React.CSSProperties;
  onUpdate?: (value: string) => void;
  maxHeight?: number;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
  generateImagePromptFn?: () => string;
}

const MainDiv = styled.div`
  .w-md-editor-toolbar {
    background-color: var(--bg-color);
    border-color: var(--block-bg);
    li {
      button {
        height: 24px;
        svg {
          color: var(--text-color);
          width: 16px;
          height: 16px;
        }
      }
      height: 24px;
    }
  }

  .w-md-editor-show-edit {
    color: var(--text-color);
    background-color: var(--bg-color);
    box-shadow: none;
    border: 1px solid var(--border-color);
  }

  .w-md-editor {
    color: var(--text-color);
    border-color: var(--border-color);
  }
  .wmde-markdown-color {
    background-color: var(--bg-color);
    color: var(--text-color);
    width: 100%;
    --color-prettylights-syntax-comment: var(--text-color);
    --color-prettylights-syntax-constant: var(--text-color);
    --color-prettylights-syntax-entity: var(--text-color);
    --color-prettylights-syntax-storage-modifier-import: var(--text-color);
    --color-prettylights-syntax-entity-tag: var(--text-color);
    --color-prettylights-syntax-keyword: var(--text-color);
    --color-prettylights-syntax-string: var(--text-color);
    --color-prettylights-syntax-variable: var(--text-color);
    --color-prettylights-syntax-brackethighlighter-unmatched: var(--text-color);
    --color-prettylights-syntax-invalid-illegal-text: var(--text-color);
    --color-prettylights-syntax-invalid-illegal-bg: var(--text-color);
    --color-prettylights-syntax-carriage-return-text: var(--text-color);
    --color-prettylights-syntax-carriage-return-bg: var(--text-color);
    --color-prettylights-syntax-string-regexp: var(--text-color);
    --color-prettylights-syntax-markup-list: var(--text-color);
    --color-prettylights-syntax-markup-heading: var(--text-color);
    --color-prettylights-syntax-markup-italic: var(--text-color);
    --color-prettylights-syntax-markup-bold: var(--text-color);
    --color-prettylights-syntax-markup-deleted-text: var(--text-color);
    --color-prettylights-syntax-markup-deleted-bg: var(--text-color);
    --color-prettylights-syntax-markup-inserted-text: var(--text-color);
    --color-prettylights-syntax-markup-inserted-bg: var(--text-color);
    --color-prettylights-syntax-markup-changed-text: var(--text-color);
    --color-prettylights-syntax-markup-changed-bg: var(--text-color);
    --color-prettylights-syntax-markup-ignored-text: var(--text-color);
    --color-prettylights-syntax-markup-ignored-bg: var(--text-color);
    --color-prettylights-syntax-meta-diff-range: var(--text-color);
    --color-prettylights-syntax-brackethighlighter-angle: var(--text-color);
    --color-prettylights-syntax-sublimelinter-gutter-mark: var(--text-color);
    --color-prettylights-syntax-constant-other-reference-link: var(--text-color);
    --color-fg-default: var(--text-color);
    --color-fg-muted: var(--text-color);
    --color-fg-subtle: var(--text-color);
    --color-canvas-default: var(--text-color);
    --color-canvas-subtle: var(--text-color);
    --color-border-default: var(--text-color);
    --color-border-muted: var(--text-color);
    --color-neutral-muted: var(--text-color);
    --color-accent-fg: var(--text-color);
    --color-accent-emphasis: var(--text-color);
    --color-attention-subtle: var(--text-color);
    --color-danger-fg: var(--text-color);
  }
  .w-md-editor-text-input {
    color: var(--text-color);
  }
  textarea {
    background-color: transparent;
    color: var(--text-color);
  }
  .language-markdown {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
`;

function MarkdownEditor({
  id = '',
  spaceId,
  objectId,
  placeholder = '',
  modelValue = '',
  generateImagePromptFn,
  error,
  editorClass,
  editorStyles,
  onUpdate,
  maxHeight,
  label,
  info,
  className,
  children,
}: MarkdownEditorProps) {
  const { showNotification } = useNotificationContext();

  const handleInputContent = (value: SetStateAction<string | undefined>) => {
    onUpdate && onUpdate(value?.toString() || '');
  };

  const fieldId = uuidV4();
  return (
    <div className="mt-2 w-full flex flex-col items-center">
      <div className="w-full flex flex-col items-start text-left">
        <label htmlFor={id || fieldId} className="block text-sm font-medium leading-6 mb-1">
          {label} {children}
        </label>
      </div>
      <div className="w-full flex justify-center">
        <MainDiv className="w-full flex justify-center items-center bg-transparent">
          <MDEditor
            value={modelValue}
            onChange={handleInputContent}
            height={250}
            textareaProps={{
              placeholder: 'Edit text',
            }}
            className={`w-full ${editorClass}`}
            preview="edit"
            commands={[
              { ...commands.title1, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H1</div> },
              { ...commands.title2, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H2</div> },
              { ...commands.title3, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H3</div> },
              commands.divider,
              commands.bold,
              commands.italic,
              commands.divider,
              commands.hr,
              commands.link,
              commands.quote,
              commands.divider,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.checkedListCommand,
              commands.divider,
              commands.codePreview,
              commands.fullscreen,
            ]}
            extraCommands={[]}
          />
        </MainDiv>
      </div>
      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default MarkdownEditor;
