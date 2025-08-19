import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form as BootstrapForm, Button, Spinner } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { updateProfile, getProfile } from '../../services/authService';
import { useAuth } from '../../features/auth/AuthContext';

function InterestForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { token } = useAuth();
  
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(token as string),
    enabled: !!user && !!token,
  });

  const [customInterestsInput, setCustomInterestsInput] = useState('');

  useEffect(() => {
    if (profile?.interests) {
      setCustomInterestsInput(profile.interests.join(', '));
    }
  }, [profile?.interests]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateProfile(token as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['recs'] });
    }
  });

  const handleInterestChange = (interest: string) => {
    const currentInterests = profile?.interests || [];
    const interestIndex = currentInterests.indexOf(interest);

    let updatedInterests;
    if (interestIndex >= 0) {
      updatedInterests = [...currentInterests];
      updatedInterests.splice(interestIndex, 1);
    } else {
      updatedInterests = [...currentInterests, interest];
    }

    updateProfileMutation.mutate({ interests: updatedInterests });
  };

  const handleCustomInterestsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = customInterestsInput
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(item => item.length > 0);

    updateProfileMutation.mutate({ interests });
  };

  if (isProfileLoading) {
    return <Spinner animation="border" />;
  }

  return (
    <div className="mb-4">
      <h5>Your Interests</h5>
      <BootstrapForm onSubmit={handleCustomInterestsSubmit}>
        <BootstrapForm.Group className="mb-3">
          <BootstrapForm.Label>Enter your interests (comma-separated)</BootstrapForm.Label>
          <BootstrapForm.Control
            type="text"
            value={customInterestsInput}
            onChange={(e) => setCustomInterestsInput(e.target.value)}
            placeholder="programming, AI, machine-learning, etc."
          />
          <BootstrapForm.Text className="text-muted">
            These will be used to recommend content that matches your interests
          </BootstrapForm.Text>
        </BootstrapForm.Group>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? <Spinner size="sm" /> : 'Update Interests'}
        </Button>
      </BootstrapForm>
    </div>
  );
}

export default InterestForm;
