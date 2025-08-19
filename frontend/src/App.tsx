import React, { useEffect, useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { 
	Container, Row, Col, Card, Button, Form as BootstrapForm, 
	Modal, Alert, Badge, Navbar, Nav, 
	Table, Spinner, Toast, ToastContainer 
} from 'react-bootstrap'
import { 
	createInteraction, fetchRecommendations, listContent, 
	createContentItem, triggerRecommendationRefresh,
	updateProfile, pollForRecommendationUpdates, getProfile
} from './api'
import { useAuth } from './auth/AuthContext'

// Login component defined outside App component to avoid context issues
function Login() {
	const { login, register } = useAuth();
	const [isLogin, setIsLogin] = useState(true);
	const [error, setError] = useState('');

	const loginSchema = Yup.object({
		username: Yup.string().required('Username is required'),
		password: Yup.string().required('Password is required')
	});

	const registerSchema = Yup.object({
		username: Yup.string().min(3, 'Must be at least 3 characters').required('Required'),
		password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
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

function App() {
	const { user, logout, isLoading, token } = useAuth();
	const [showAddContent, setShowAddContent] = useState(false)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState('')
	const [toastVariant, setToastVariant] = useState('primary')
	const queryClient = useQueryClient()

	// Set up polling for recommendations
	useEffect(() => {
		if (!user || !token) return;
		
		// Check for updates every 30 seconds
		const pollInterval = setInterval(() => {
			pollForRecommendationUpdates(token, () => {
				queryClient.invalidateQueries({ queryKey: ['recs'] });
			});
		}, 30000);
		
		return () => {
			clearInterval(pollInterval);
		};
	}, [user, token, queryClient])

	const recsQuery = useQuery({
		queryKey: ['recs'],
		queryFn: () => {
			if (!token) throw new Error('Authentication required');
			return fetchRecommendations(token);
		},
		enabled: !!user && !!token,
	})

	const contentQuery = useQuery({
		queryKey: ['content'],
		queryFn: () => {
			if (!token) throw new Error('Authentication required');
			return listContent(token);
		},
		enabled: !!user && !!token,
	})
	
	const createContentMutation = useMutation({
		mutationFn: (data: any) => {
			if (!token) throw new Error('Authentication required');
			return createContentItem(token, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['content'] })
			setShowAddContent(false)
			setToastMessage('Content item created successfully!')
			setShowToast(true)
		},
		onError: () => {
			setToastMessage('Failed to create content item')
			setShowToast(true)
		}
	})

	const refreshRecommendationsMutation = useMutation({
		mutationFn: () => {
			if (!token) throw new Error('Authentication required');
			return triggerRecommendationRefresh(token);
		},
		onSuccess: () => {
			setToastMessage('Recommendation refresh triggered! Check back in a few moments.')
			setShowToast(true)
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['recs'] })
			}, 5000)
		},
		onError: () => {
			setToastMessage('Failed to trigger recommendation refresh.')
			setShowToast(true)
		}
	})

	const interactionMutation = useMutation({
		mutationFn: (data: { content_item: number; action: string; score: number }) => {
			if (!token) throw new Error('Authentication required');
			
			// Standardize scores for each action type
			let score = data.score;
			if (data.action === 'liked') {
				score = 2; // Higher score for likes
			} else if (data.action === 'disliked') {
				score = -1; // Negative score for dismissals
			} else {
				score = 1; // Default score for views
			}
			
			console.log(`Creating ${data.action} interaction for content item ${data.content_item} with score ${score}`);
			
			return createInteraction(token, {
				...data,
				score: score,
				context: {} // Add context field to fix database constraint error
			});
		},
		onSuccess: (_data, variables, context: any) => {
			// Get the content item name from the context
			const itemName = context?.itemName || 'content';
			
			// Set toast message and color based on action
			if (variables.action === 'liked') {
				setToastMessage(`You have liked ${itemName}`);
				setToastVariant('success');
			} else if (variables.action === 'disliked') {
				setToastMessage(`You have disliked ${itemName}`);
				setToastVariant('danger');
				queryClient.invalidateQueries({ queryKey: ['recs'] });
			} else if (variables.action === 'viewed') {
				setToastMessage(`You have viewed ${itemName}`);
				setToastVariant('info');
			}
			
			setShowToast(true);
			console.log('Interaction successful:', variables);
		},
		onError: (error: any) => {
			console.error('Interaction error:', error);
			setToastMessage('An error occurred with your interaction.');
			setShowToast(true);
		}
	});

	if (isLoading) {
		return (
			<Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
				<Spinner animation="border" />
			</Container>
		)
	}

	return (
		<>
			<Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
				<Container>
					<Navbar.Brand href="#home">Personalized Learning Platform</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ms-auto">
							{user ? (
								<>
									<Navbar.Text className="me-3">
										Signed in as: {user.username}
									</Navbar.Text>
									{user.is_staff && (
										<Button 
											variant="outline-light" 
											onClick={() => setShowAddContent(true)}
											className="ms-2"
										>
											Add Content
										</Button>
									)}
									<Button variant="outline-light" onClick={logout} className="ms-2">
										Logout
									</Button>
								</>
							) : (
								<Nav.Link href="#login">Login</Nav.Link>
							)}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			<Container>
				{!user ? (
					<Row className="justify-content-center">
						<Col md={6}>
							<Login />
						</Col>
					</Row>
				) : (
					<>
						<Row>
							<Col md={8}>
								<Card className="mb-4">
									<Card.Header className="d-flex justify-content-between align-items-center">
										<h5 className="mb-0">AI Recommendations</h5>
										<Button 
											size="sm" 
											onClick={() => refreshRecommendationsMutation.mutate()}
											disabled={refreshRecommendationsMutation.isPending}
										>
											{refreshRecommendationsMutation.isPending ? (
												<><Spinner size="sm" animation="border" /> Refreshing...</>
											) : (
												<>🔄 Refresh Recommendations</>
											)}
										</Button>
									</Card.Header>
									<Card.Body>
										{recsQuery.isLoading ? (
											<div className="text-center p-4">
												<Spinner animation="border" />
												<p className="mt-2">Loading recommendations...</p>
											</div>
										) : recsQuery.isError ? (
											<Alert variant="danger">
												Error loading recommendations
											</Alert>
										) : recsQuery.data?.results?.length === 0 ? (
											<div className="text-center p-4">
												<p>No recommendations yet. Update your profile interests or interact with some content!</p>
												<InterestForm />
											</div>
										) : (
											<>
												{/* Recommendation priority display */}
												<div className="mb-4">
													<div className="d-flex align-items-center">
														<h6 className="mb-0 me-2">Showing recommendations by priority:</h6>
														<Badge key="interest-priority" bg="primary" className="me-1">Interests</Badge>
														<Badge key="likes-priority" bg="success" className="me-1">Likes</Badge>
														<Badge key="views-priority" bg="info">Views</Badge>
													</div>
													<small className="text-muted">disliked content is excluded from recommendations</small>
												</div>

												<Row xs={1} md={2} className="g-4">
													{/* Sort recommendations by priority: Interests (matching_interests), then Likes, then Views */}
													{recsQuery.data?.results
														.filter((item: any) => {
															// Remove disliked items completely
															return item.user_interaction !== 'disliked';
														})
														.sort((a: any, b: any) => {
															// Priority 1: Interest matches (highest first)
															const aHasInterests = a.matching_interests?.length > 0;
															const bHasInterests = b.matching_interests?.length > 0;
															
															if (aHasInterests !== bHasInterests) {
																return aHasInterests ? -1 : 1; // Items with matching interests come first
															}
															
															// If both have interests, compare by interest match score
															if (aHasInterests && bHasInterests) {
																if ((a.interest_match_score || 0) !== (b.interest_match_score || 0)) {
																	return (b.interest_match_score || 0) - (a.interest_match_score || 0);
																}
															}
															
															// Priority 2: Interaction type (likes > views)
															const aLiked = a.user_interaction === 'liked';
															const bLiked = b.user_interaction === 'liked';
															
															if (aLiked !== bLiked) {
																return aLiked ? -1 : 1; // Liked items come before non-liked items
															}
															
															const aViewed = a.user_interaction === 'viewed';
															const bViewed = b.user_interaction === 'viewed';
															
															if (aViewed !== bViewed) {
																return aViewed ? -1 : 1; // Viewed items come before non-viewed items
															}
															
															// Priority 3: Predicted rating (highest first)
															return (b.predicted_rating || 0) - (a.predicted_rating || 0);
														})
														.map((item: any) => {
															// Get matching interests for this item
															const matchingInterests = item.matching_interests || [];
															const matchingTags = item.tags.filter((tag: string) => matchingInterests.includes(tag));
															const otherTags = item.tags.filter((tag: string) => !matchingInterests.includes(tag));
															
															return (
																<Col key={item.content_item_id}>
																	<Card className={matchingInterests.length > 0 ? "border-primary" : item.user_interaction === 'liked' ? "border-success" : item.user_interaction === 'viewed' ? "border-info" : ""}>
																		{matchingInterests.length > 0 && (
																			<Card.Header className="bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
																				<span>Interest Match</span>
																				<Badge bg="primary" pill>
																					{Math.round((item.interest_match_score || 0) * 20)}%
																				</Badge>
																			</Card.Header>
																		)}
																		{!matchingInterests.length && item.user_interaction === 'liked' && (
																			<Card.Header className="bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
																				<span>You Liked This</span>
																				<Badge bg="success" pill>👍</Badge>
																			</Card.Header>
																		)}
																		{!matchingInterests.length && item.user_interaction === 'viewed' && (
																			<Card.Header className="bg-info bg-opacity-10 d-flex justify-content-between align-items-center">
																				<span>Previously Viewed</span>
																				<Badge bg="info" pill>👁️</Badge>
																			</Card.Header>
																		)}
																		<Card.Body>
																			<Card.Title>{item.title}</Card.Title>
																			<Card.Text>
																				{item.description.substring(0, 100)}
																				{item.description.length > 100 ? '...' : ''}
																			</Card.Text>
																			
																			{/* Display tags with special highlighting for matching interests */}
																			<div className="mb-3">
																				{matchingTags.length > 0 && (
																					<div className="mb-1">
																						<small className="text-muted d-block mb-1">
																							<strong>Matching your interests:</strong>
																						</small>
																						{matchingTags.map((tag: string) => (
																							<Badge key={tag} bg="primary" className="me-1 mb-1">
																								✓ {tag}
																							</Badge>
																						))}
																					</div>
																				)}
																				{otherTags.length > 0 && (
																					<div className="mt-1">
																						<small className="text-muted d-block mb-1">Other tags:</small>
																						{otherTags.map((tag: string) => (
																							<Badge key={tag} bg="secondary" className="me-1 mb-1">{tag}</Badge>
																						))}
																					</div>
																				)}
																			</div>
																			
																			<div className="d-flex justify-content-between align-items-center">
																				<Button 
																					size="sm" 
																					variant="outline-primary"
																					href={item.url} 
																					target="_blank"
																					onClick={() => {
																						console.log('Content item data:', item);
																						const itemId = item.content_item_id || item.id;
																						const itemName = item.title || 'content';
																						interactionMutation.mutate(
																							{ content_item: parseInt(itemId), action: 'viewed', score: 1 },
																							
																						);
																					}}
																				>
																					View
																				</Button>
																				<div>
																					<Button 
																						size="sm" 
																						variant="outline-success" 
																						className="me-1"
																						onClick={() => {
																							console.log('Content item data:', item);
																							const itemId = item.content_item_id || item.id;
																							const itemName = item.title || 'content';
																							interactionMutation.mutate(
																								{ content_item: parseInt(itemId), action: 'liked', score: 2 },
																								
																							);
																						}}
																					>
																						👍 Like
																					</Button>
																					<Button 
																						size="sm" 
																						variant="outline-danger"
																						onClick={() => {
																							console.log('Content item data:', item);
																							const itemId = item.content_item_id || item.id;
																							if (!itemId) {
																								console.error('No valid content item ID found!', item);
																								setToastMessage('Error: Could not find content ID');
																								setShowToast(true);
																								return;
																							}
																							const itemName = item.title || 'content';
																							interactionMutation.mutate(
																								{ 
																									content_item: parseInt(itemId), 
																									action: 'disliked',
																									score: -1 
																								},
																							);
																						}}
																					>
																						👎 Dislike
																					</Button>
																				</div>
																			</div>
																		</Card.Body>
																	</Card>
																</Col>
															);
														})
													}
												</Row>
											</>
										)}
									</Card.Body>
								</Card>
							</Col>
							<Col md={4}>
								<InterestForm />
							</Col>
						</Row>
						<Row>
							<Col>
								<Card className="mt-4">
									<Card.Header>
										<h5 className="mb-0">All Content</h5>
									</Card.Header>
									<Card.Body>
										{contentQuery.isLoading ? (
											<div className="text-center p-4">
												<Spinner animation="border" />
											</div>
										) : contentQuery.isError ? (
											<Alert variant="danger">
												Error loading content
											</Alert>
										) : (
											<div className="table-responsive">
												<Table striped hover>
													<thead>
														<tr>
															<th>Title</th>
															<th>Type</th>
															<th>Tags</th>
															<th>Actions</th>
														</tr>
													</thead>
													<tbody>
														{contentQuery.data?.results?.map((item: any) => (
															<tr key={item.id}>
																<td>{item.title}</td>
																<td>{item.content_type}</td>
																<td>
																	{item.tags.map((tag: string) => (
																		<Badge key={tag} bg="secondary" className="me-1">{tag}</Badge>
																	))}
																</td>
																<td>
																	<Button 
																		size="sm" 
																		variant="outline-primary"
																		href={item.url} 
																		target="_blank"
																		className="me-1"
																		onClick={() => {
																			console.log('Content item data:', item);
																			const itemId = item.id || item.content_item_id;
																			interactionMutation.mutate({ content_item: parseInt(itemId), action: 'viewed', score: 1 });
																		}}
																	>
																		View
																	</Button>
																	<Button 
																		size="sm" 
																		variant="outline-success" 
																		className="me-1"
																		onClick={() => {
																			console.log('Content item data:', item);
																			const itemId = item.id || item.content_item_id;
																			interactionMutation.mutate({ content_item: parseInt(itemId), action: 'liked', score: 1 });
																		}}
																	>
																		👍
																	</Button>
																	<Button 
																		size="sm" 
																		variant="outline-danger"
																		onClick={() => {
																			console.log('Content item data:', item);
																			const itemId = item.id || item.content_item_id;
																			interactionMutation.mutate({ content_item: parseInt(itemId), action: 'disliked', score: 1 });
																		}}
																	>
																		👎
																	</Button>
																</td>
															</tr>
														))}
													</tbody>
												</Table>
											</div>
										)}
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</>
				)}
			</Container>

			<AddContentModal 
				show={showAddContent}
				onHide={() => setShowAddContent(false)}
				onSubmit={createContentMutation.mutate}
				isLoading={createContentMutation.isPending}
			/>

			<ToastContainer position="bottom-end" className="p-3">
				<Toast 
					show={showToast} 
					onClose={() => setShowToast(false)} 
					delay={3000} 
					autohide
					bg={toastVariant}
					className={toastVariant === 'danger' || toastVariant === 'dark' ? 'text-white' : ''}
				>
					<Toast.Header>
						<strong className="me-auto">Notification</strong>
					</Toast.Header>
					<Toast.Body>{toastMessage}</Toast.Body>
				</Toast>
			</ToastContainer>
		</>
	)
}

function InterestForm() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	
	const { token } = useAuth();
	
	const { data: profile, isLoading: isProfileLoading } = useQuery({
		queryKey: ['profile', user?.id],
		queryFn: () => {
			if (!token) throw new Error('Authentication required');
			return getProfile(token);
		},
		enabled: !!user && !!token,
	});

	const [customInterestsInput, setCustomInterestsInput] = useState('');

	useEffect(() => {
		if (profile?.interests && profile.interests.length > 0) {
			setCustomInterestsInput(profile.interests.join(', '));
		}
	}, [profile?.interests]);

	const updateProfileMutation = useMutation({
		mutationFn: (data: any) => {
			if (!token) throw new Error('Authentication required');
			return updateProfile(token, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
			queryClient.invalidateQueries({ queryKey: ['recs'] });
		}
	});

	const handleInterestChange = (interest: string) => {
		if (!profile) return;
		
		const currentInterests = profile.interests || [];
		const updatedInterests = currentInterests.includes(interest)
			? currentInterests.filter((i: string) => i !== interest)
			: [...currentInterests, interest];
		
		updateProfileMutation.mutate({ interests: updatedInterests });
	};

	const handleCustomInterestsSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;
		
		// Parse CSV input into array, trim whitespace, and remove empty entries
		const interests = customInterestsInput
			.split(',')
			.map(interest => interest.trim())
			.filter(interest => interest.length > 0);
		
		updateProfileMutation.mutate({ interests });
	};

	const interestCategories = [
		{ name: 'Programming', interests: ['Python', 'JavaScript', 'Web Development', 'Data Science', 'Mobile Apps'] },
		{ name: 'Science', interests: ['Physics', 'Biology', 'Chemistry', 'Astronomy', 'Mathematics'] },
		{ name: 'Business', interests: ['Marketing', 'Finance', 'Entrepreneurship', 'Management', 'Economics'] },
		{ name: 'Arts', interests: ['Drawing', 'Music', 'Photography', 'Literature', 'History'] },
		{ name: 'Other', interests: ['Health', 'Self-improvement', 'Language Learning', 'Cooking'] }
	];

	return (
		<Card>
			<Card.Header>
				<h5 className="mb-0">Your Interests</h5>
			</Card.Header>
			<Card.Body>
				{isProfileLoading ? (
					<div className="text-center">
						<Spinner animation="border" size="sm" />
					</div>
				) : (
					<>
						<form onSubmit={handleCustomInterestsSubmit}>
							<BootstrapForm.Group className="mb-3">
								<BootstrapForm.Label>
									<strong>Your Interests (comma-separated)</strong>
								</BootstrapForm.Label>
								<BootstrapForm.Control
									as="textarea"
									value={customInterestsInput}
									onChange={(e) => setCustomInterestsInput(e.target.value)}
									disabled={updateProfileMutation.isPending}
									placeholder="Enter interests separated by commas (e.g., Python, JavaScript, Music)"
									rows={3}
								/>
								<BootstrapForm.Text className="text-muted">
									Enter your interests separated by commas
								</BootstrapForm.Text>
							</BootstrapForm.Group>
							
							<div className="d-flex justify-content-between mb-4">
								<Button 
									variant="primary" 
									type="submit"
									disabled={updateProfileMutation.isPending}
									size="sm"
								>
									{updateProfileMutation.isPending ? (
										<><Spinner size="sm" animation="border" /> Saving...</>
									) : (
										'Save Interests'
									)}
								</Button>
							</div>
						</form>

						<div className="mt-4">
							<h6>Current Interests:</h6>
							<div>
								{profile?.interests?.length > 0 ? (
									profile.interests.map((interest: string) => (
										<Badge 
											key={interest} 
											bg="info" 
											className="me-1 mb-1 p-2"
										>
											{interest}
											<span 
												className="ms-1" 
												style={{ cursor: 'pointer' }}
												onClick={() => handleInterestChange(interest)}
											>
												✕
											</span>
										</Badge>
									))
								) : (
									<p className="text-muted">No interests selected. Add some to get better recommendations.</p>
								)}
							</div>
						</div>

						<hr />
						
						<div className="mt-4">
							<h6>Suggested Interest Categories:</h6>
							{interestCategories.map(category => (
								<div key={category.name} className="mb-3">
									<h6 className="text-muted">{category.name}</h6>
									<div>
										{category.interests.map(interest => (
											<Badge
												key={interest}
												bg={profile?.interests?.includes(interest) ? "info" : "light"}
												text={profile?.interests?.includes(interest) ? "white" : "dark"}
												className="me-1 mb-1 p-2"
												style={{ cursor: 'pointer' }}
												onClick={() => handleInterestChange(interest)}
											>
												{interest}
											</Badge>
										))}
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</Card.Body>
		</Card>
	);
}

function AddContentModal(props: {
	show: boolean;
	onHide: () => void;
	onSubmit: (data: any) => void;
	isLoading: boolean;
}) {
	return (
		<Modal show={props.show} onHide={props.onHide}>
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
					validationSchema={Yup.object({
						title: Yup.string().required('Required'),
						description: Yup.string().required('Required'),
						content_type: Yup.string().required('Required'),
						url: Yup.string().url('Must be a valid URL').required('Required'),
						tags: Yup.string().required('Required')
					})}
					onSubmit={(values) => {
						props.onSubmit({
							...values,
							tags: values.tags.split(',').map(tag => tag.trim())
						});
					}}
				>
					<Form>
						<BootstrapForm.Group className="mb-3">
							<label>Title</label>
							<Field name="title" className="form-control" />
							<ErrorMessage name="title" component="div" className="text-danger" />
						</BootstrapForm.Group>
						<BootstrapForm.Group className="mb-3">
							<label>Description</label>
							<Field name="description" as="textarea" className="form-control" />
							<ErrorMessage name="description" component="div" className="text-danger" />
						</BootstrapForm.Group>
						<BootstrapForm.Group className="mb-3">
							<label>Content Type</label>
							<Field as="select" name="content_type" className="form-select">
								<option value="article">Article</option>
								<option value="video">Video</option>
								<option value="quiz">Quiz</option>
							</Field>
						</BootstrapForm.Group>
						<BootstrapForm.Group className="mb-3">
							<label>URL</label>
							<Field name="url" className="form-control" />
						</BootstrapForm.Group>
						<BootstrapForm.Group className="mb-3">
							<label>Tags (comma-separated)</label>
							<Field name="tags" className="form-control" />
							<ErrorMessage name="tags" component="div" className="text-danger" />
						</BootstrapForm.Group>
						<Button type="submit" disabled={props.isLoading}>{props.isLoading ? 'Adding...' : 'Add Content'}</Button>
					</Form>
				</Formik>
			</Modal.Body>
		</Modal>
	);
}

export default App;
