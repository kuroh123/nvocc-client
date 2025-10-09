import React from "react";
import { Modal } from "antd";

const FormModal = ({
  visible,
  onCancel,
  title,
  children,
  width = 600,
  footer = null,
  destroyOnClose = true,
  maskClosable = false,
  ...restProps
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={footer}
      width={width}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      {...restProps}
    >
      {children}
    </Modal>
  );
};

export default FormModal;
