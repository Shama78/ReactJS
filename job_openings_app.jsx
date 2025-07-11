import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
  useParams
} from 'react-router-dom';
import { Search } from 'lucide-react';

const API_BASE = 'https://teknorix.jobsoid.com/api';

function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries([...searchParams]);
  return [filters, setSearchParams];
}

function JobFilters({ filters, setFilters }) {
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key];
    setFilters(newFilters);
  };

  const clearAll = () => {
    setFilters({});
  };

  const departments = ["IT", "Management", "HR", "CX", "Development"];
  const locations = ["Panjim", "Verna", "Madgaon", "Colvale", "Canca", "Parra", "Mapusa"];
  const functions = ["Development", "Consulting", "Meetings", "Conference"];

  return (
    <div className="bg-gray-100 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex w-full border rounded bg-white items-center px-2">
          <input
            type="text"
            placeholder="Search for Job"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="p-2 w-full outline-none"
          />
          <Search className="text-green-600 cursor-pointer" size={18} />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <select
          value={filters.department || ''}
          onChange={(e) => updateFilter('department', e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value=''>Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={filters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value=''>Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={filters.function || ''}
          onChange={(e) => updateFilter('function', e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value=''>Function</option>
          {functions.map((func) => (
            <option key={func} value={func}>{func}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <span key={key} className="bg-white px-2 py-1 rounded border">
              {value}
              <button onClick={() => updateFilter(key, '')} className="ml-2 text-green-600">×</button>
            </span>
          ))}
        </div>
        {Object.keys(filters).length > 0 && (
          <button onClick={clearAll} className="text-green-600 text-sm">Clear All</button>
        )}
      </div>
    </div>
  );
}

function JobList() {
  const [filters, setSearchParams] = useQueryParams();
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`${API_BASE}/jobs?${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJobs(data);
        else setJobs([]);
      });
  }, [filters]);

  return (
    <div>
      <JobFilters filters={filters} setFilters={setSearchParams} />
      <div className="p-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border mb-2 cursor-pointer hover:bg-gray-50"
            onClick={() => navigate(`/jobs/${job.id}?${new URLSearchParams(filters).toString()}`)}
          >
            <h3 className="font-bold">{job.title}</h3>
            <p>
              {job.department?.name || job.department} | {job.location?.name || job.location} | {job.function?.name || job.function}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [filters] = useQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/jobs/${id}`)
      .then((res) => res.json())
      .then(setJob);
  }, [id]);

  if (!job) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(`/jobs?${new URLSearchParams(filters).toString()}`)}
        className="mb-4 underline text-blue-500"
      >
        Back to list
      </button>
      <h2 className="text-2xl font-bold">{job.title}</h2>
      <p className="text-gray-600">
        {job.department?.name || job.department} | {job.location?.name || job.location} | {job.function?.name || job.function}
      </p>
      <div className="mt-4">
        <p>{job.description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="*" element={<JobList />} />
      </Routes>
    </Router>
  );
}
