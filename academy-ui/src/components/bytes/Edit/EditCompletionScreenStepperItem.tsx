import SelectImageInputModal from '@/components/app/Image/SelectImageInputModal';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import { ImageType } from '@/graphql/generated/generated-types';
import { CompletionScreenDto, CompletionScreenItem } from '@/types/bytes/ByteDto';
import { EditByteType } from '@/types/request/ByteRequests';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import CallToActionButtonForm from '@dodao/web-core/components/app/Common/CallToActionButtonForm';
import AddCompletionScreenItemsModal from '@dodao/web-core/components/app/Modal/CompletionScreenItem/AddCompletionScreenItemsModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import { InputWithButton } from '@dodao/web-core/components/core/input/InputWithButton';
import { ByteErrors } from '@dodao/web-core/types/errors/byteErrors';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './EditCompletionScreenStepperItem.module.scss';

interface EditCompletionScreenStepperItemProps {
  byteErrors?: ByteErrors;
  space: SpaceWithIntegrationsDto;
  byte: EditByteType;
  updateByteCompletionScreen: (field: keyof CompletionScreenDto, value: any) => void;
  removeCompletionScreen: () => void;
  addButtonLink: (uuid: string, link: string) => void;
  addButtonLabel: (uuid: string, label: string) => void;
  removeCompletionScreenItemButton: (uuid: string) => void;
}

export default function EditCompletionScreenStepperItem({
  space,
  byte,
  updateByteCompletionScreen,
  removeCompletionScreen,
  addButtonLabel,
  addButtonLink,
  removeCompletionScreenItemButton,
  byteErrors,
}: EditCompletionScreenStepperItemProps) {
  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);
  const [modalAddButtonInput, setModalAddButtonInput] = useState(false);

  const showButtonComponent = byte.completionScreen?.items && byte.completionScreen.items.length > 0;

  const updateCompletionScreenImageUrl = (imageUrl: string | null) => {
    updateByteCompletionScreen('imageUrl', imageUrl);
  };

  const handleDelete = () => {
    removeCompletionScreen();
  };

  const updateCompletionScreenContent = (content: string) => {
    updateByteCompletionScreen('content', content);
  };
  function addButton() {
    const input: CompletionScreenItem = {
      uuid: uuidv4(),
      label: '',
      link: '',
    };
    updateByteCompletionScreen('items', input);
  }

  return (
    <div className={'w-full ' + styles.CompletionScreenItemContainer}>
      <div>
        <div style={{ minHeight: '20px' }}>
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.GuideAddIcon}
            removeBorder
            onClick={() => setModalAddButtonInput(true)}
            tooltip="Add Button"
          />
          <IconButton className="float-right ml-2" iconName={IconTypes.Trash} removeBorder onClick={() => handleDelete()} tooltip="Delete Completion Step" />
        </div>
        <div className="w-full mb-4">
          <Input
            modelValue={byte.completionScreen?.name}
            required
            onUpdate={(e) => {
              updateByteCompletionScreen('name', e?.toString());
            }}
            error={byteErrors?.completionScreen?.name ? 'Name is required' : ''}
            placeholder="Completion Screen Name"
          >
            Name*
          </Input>
        </div>
        <div className="w-full mb-4">
          <InputWithButton
            buttonLabel={'Set Image'}
            inputLabel={'Image Url'}
            onButtonClick={() => setSelectImageUploadModal(true)}
            onInputUpdate={(e) => {
              updateCompletionScreenImageUrl(e?.toString() || '');
            }}
            inputModelValue={byte.completionScreen?.imageUrl ?? ''}
            inputPlaceholder="Image Url"
          />
        </div>

        <MarkdownEditor
          id={byte.completionScreen?.uuid || byte.id}
          modelValue={byte.completionScreen?.content}
          placeholder={'Contents'}
          onUpdate={updateCompletionScreenContent}
          spaceId={space.id}
          objectId={byte.id || 'unknown_byte_id'}
          imageType={ImageType.Tidbits}
          editorStyles={{ height: '200px' }}
          error={byteErrors?.completionScreen?.content ? 'Content is required' : ''}
        />
      </div>

      {showButtonComponent &&
        byte.completionScreen?.items.map((item) => (
          <CallToActionButtonForm
            key={item.uuid}
            item={item}
            updateUserInputLabel={addButtonLabel}
            updateUserInputLink={addButtonLink}
            removeButton={removeCompletionScreenItemButton}
          />
        ))}
      {selectImageUploadModal && (
        <div className={styles.CompletionScreenItemWrapper}>
          <SelectImageInputModal
            open={selectImageUploadModal}
            onClose={() => setSelectImageUploadModal(false)}
            imageType={ImageType.Tidbits}
            objectId={byte.id || 'unknown_byte_id'}
            spaceId={space.id}
            imageUploaded={(imageUrl) => {
              updateCompletionScreenImageUrl(imageUrl);
              setSelectImageUploadModal(false);
            }}
          />
        </div>
      )}

      {modalAddButtonInput && (
        <AddCompletionScreenItemsModal
          open={modalAddButtonInput}
          onClose={() => setModalAddButtonInput(false)}
          onAddButton={() => {
            addButton();
          }}
        />
      )}
    </div>
  );
}
