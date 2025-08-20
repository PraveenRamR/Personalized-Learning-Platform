import React, { useState } from 'react';
import { ProgressBar, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../../features/auth/AuthContext';
import { updateUserGoal, createUserGoal } from '../../services/dashboardService';
import { GoalProgress } from '../../features/dashboard/DashboardContext';

interface GoalsTrackerProps {
  goals: GoalProgress[];
}

const GoalsTracker: React.FC<GoalsTrackerProps> = ({ goals }) => {
  const { token } = useAuth();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    target: 10,
    unit: 'items',
    dueDate: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: name === 'target' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createUserGoal(token, formValues);
      setShowNewGoalModal(false);
      setFormValues({
        title: '',
        target: 10,
        unit: 'items',
        dueDate: ''
      });
      // After successful creation, we should refresh the dashboard
      // This would typically be handled by the parent component or context
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };
  
  return (
    <div className="goals-tracker">
      {goals.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">You haven't set any learning goals yet.</p>
          <Button 
            variant="primary" 
            onClick={() => setShowNewGoalModal(true)}
          >
            Set Your First Goal
          </Button>
        </div>
      ) : (
        <>
          {goals.map((goal) => (
            <div key={goal.id} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0">{goal.title}</h6>
                <span>
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <ProgressBar 
                now={Math.min((goal.current / goal.target) * 100, 100)} 
                variant={goal.current >= goal.target ? "success" : "primary"}
                className="mb-1"
              />
              {goal.dueDate && (
                <small className="text-muted">
                  Due by: {new Date(goal.dueDate).toLocaleDateString()}
                </small>
              )}
            </div>
          ))}
          <div className="mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowNewGoalModal(true)}
            >
              Add New Goal
            </Button>
          </div>
        </>
      )}

      {/* New Goal Modal */}
      <Modal show={showNewGoalModal} onHide={() => setShowNewGoalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Learning Goal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control 
                type="text"
                name="title"
                value={formValues.title}
                onChange={handleInputChange}
                placeholder="e.g., Complete Python Basics Course"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target Amount</Form.Label>
              <Form.Control 
                type="number"
                name="target"
                value={formValues.target}
                onChange={handleInputChange}
                min={1}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Control 
                type="text"
                name="unit"
                value={formValues.unit}
                onChange={handleInputChange}
                placeholder="e.g., lessons, chapters, courses"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date (Optional)</Form.Label>
              <Form.Control 
                type="date"
                name="dueDate"
                value={formValues.dueDate}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewGoalModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Goal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default GoalsTracker;
