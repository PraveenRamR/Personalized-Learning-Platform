import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Card, Button, Form as BootstrapForm, Nav, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../features/auth/AuthContext';

function LoginForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const loginSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const registerSchema = Yup.object({
    username: Yup.string().min(3, 'Must be at least 3 characters').required('Required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    email: Yup.string().email('Invalid email address'),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => isLogin ? login(values.username, values.password) : register(values),
    onSuccess: () => {
      setError('');
    },
    onError: (err: any) => {
      const message = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(`${isLogin ? 'Login' : 'Registration'} failed: ${message}`);
    }
  });

  return (
    <Card>
      <Card.Header>
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link active={isLogin} onClick={() => setIsLogin(true)}>Login</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={!isLogin} onClick={() => setIsLogin(false)}>Register</Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Formik
          initialValues={isLogin ? { username: '', password: '' } : { username: '', password: '', email: '', first_name: '', last_name: '' }}
          validationSchema={isLogin ? loginSchema : registerSchema}
          onSubmit={(values) => mutation.mutate(values)}
        >
          <Form>
            <BootstrapForm.Group className="mb-3">
              <label htmlFor="username">Username</label>
              <Field id="username" name="username" className="form-control" />
              <ErrorMessage name="username" component="div" className="text-danger" />
            </BootstrapForm.Group>
            
            <BootstrapForm.Group className="mb-3">
              <label htmlFor="password">Password</label>
              <Field id="password" name="password" type="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </BootstrapForm.Group>
            
            {!isLogin && (
              <>
                <BootstrapForm.Group className="mb-3">
                  <label htmlFor="email">Email</label>
                  <Field id="email" name="email" type="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="text-danger" />
                </BootstrapForm.Group>
                
                <BootstrapForm.Group className="mb-3">
                  <label htmlFor="first_name">First Name</label>
                  <Field id="first_name" name="first_name" className="form-control" />
                </BootstrapForm.Group>
                
                <BootstrapForm.Group className="mb-3">
                  <label htmlFor="last_name">Last Name</label>
                  <Field id="last_name" name="last_name" className="form-control" />
                </BootstrapForm.Group>
              </>
            )}
            
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner size="sm" /> : isLogin ? 'Login' : 'Register'}
            </Button>
          </Form>
        </Formik>
      </Card.Body>
    </Card>
  );
}

export default LoginForm;
