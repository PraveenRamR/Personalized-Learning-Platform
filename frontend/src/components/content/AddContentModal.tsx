import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface AddContentModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const contentSchema = Yup.object({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  content_type: Yup.string().required('Required'),
  url: Yup.string().url('Must be a valid URL'),
  tags: Yup.string()
});

function AddContentModal({ show, onHide, onSubmit, isLoading }: AddContentModalProps) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Content</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={{
            title: '',
            description: '',
            content_type: 'article',
            url: '',
            tags: ''
          }}
          validationSchema={contentSchema}
          onSubmit={(values) => {
            const tagsArray = values.tags
              .split(',')
              .map(tag => tag.trim().toLowerCase())
              .filter(tag => tag);

            onSubmit({
              ...values,
              tags: tagsArray
            });
          }}
        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Field name="title" as={Form.Control} />
                <ErrorMessage name="title" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Field name="description" as={Form.Control} label="textarea" rows={3} />
                <ErrorMessage name="description" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Content Type</Form.Label>
                <Field name="content_type" as={Form.Select}>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                </Field>
                <ErrorMessage name="content_type" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>URL</Form.Label>
                <Field name="url" as={Form.Control} />
                <ErrorMessage name="url" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Field name="tags" as={Form.Control} placeholder="e.g., python, ai, learning" />
                <Form.Text className="text-muted">
                  Tags help match content with user interests
                </Form.Text>
                <ErrorMessage name="tags" component="div" className="text-danger" />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={onHide}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="sm" animation="border" /> : 'Submit'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

export default AddContentModal;
