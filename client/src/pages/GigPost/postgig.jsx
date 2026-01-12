import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { gigAPI } from '../../services/api';
import { addGig } from '../../store/gigSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: 'other',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await gigAPI.createGig({
        ...formData,
        budget: parseFloat(formData.budget),
      });
      
      dispatch(addGig(response.data));
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Gig</h1>
        <p className="text-gray-600">Find the perfect freelancer for your project</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Input
          label="Job Title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Build a React Dashboard"
        />

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your project in detail..."
          />
        </div>

        <Input
          label="Budget ($)"
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="500"
        />

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Post Gig
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostGig;