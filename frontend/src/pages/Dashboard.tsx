import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WORKOUTS } from '../graphql/queries';
import { ADD_WORKOUT } from '../graphql/mutations';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { loading, error, data } = useQuery(GET_WORKOUTS);
    const [addWorkout] = useMutation(ADD_WORKOUT, {
      refetchQueries: [{ query: GET_WORKOUTS }],
    });
  
    const [formState, setFormState] = useState({
      session_type: '',
      date: '',
      total_duration: 0,
      total_distance: 0,
    });
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await addWorkout({ variables: formState });
      setFormState({ session_type: '', date: '', total_duration: 0, total_distance: 0 });
    };
  
    if (loading) return <p>Loading workouts...</p>;
    if (error) return <p>Error loading workouts: {error.message}</p>;
  
    return (
      <div>
        <h1>Workout Dashboard</h1>
  
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Session Type"
            value={formState.session_type}
            onChange={(e) => setFormState({ ...formState, session_type: e.target.value })}
            required
          />
          <input
            type="date"
            value={formState.date}
            onChange={(e) => setFormState({ ...formState, date: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Duration (sec)"
            value={formState.total_duration}
            onChange={(e) => setFormState({ ...formState, total_duration: Number(e.target.value) })}
            required
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={formState.total_distance}
            onChange={(e) => setFormState({ ...formState, total_distance: Number(e.target.value) })}
            required
          />
          <button type="submit">Add Workout</button>
        </form>
  
        <ul>
          {data.workouts.map((workout: any) => (
            <li key={workout.id}>
              <strong>{workout.session_type}</strong> - {workout.date} - {workout.total_distance} km
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Dashboard;