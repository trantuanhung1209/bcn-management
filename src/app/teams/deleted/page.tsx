'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface DeletedTeam {
  _id: string;
  name: string;
  description: string;
  teamLeader: string;
  members?: string[];
  projects?: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function DeletedTeamsPage() {
  const [deletedTeams, setDeletedTeams] = useState<DeletedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeletedTeams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/teams/deleted?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setDeletedTeams(result.data.teams);
        setTotalPages(result.data.totalPages);
      } else {
        console.error('Failed to fetch deleted teams:', result.error);
      }
    } catch (error) {
      console.error('Error fetching deleted teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (teamId: string) => {
    try {
      setRestoring(teamId);
      const response = await fetch(`/api/teams/${teamId}/restore`, {
        method: 'PUT',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from deleted teams list
        setDeletedTeams(prev => prev.filter(team => team._id !== teamId));
        alert('Team restored successfully!');
      } else {
        alert(`Failed to restore team: ${result.error}`);
      }
    } catch (error) {
      console.error('Error restoring team:', error);
      alert('Error restoring team');
    } finally {
      setRestoring(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeletedTeams();
  };

  useEffect(() => {
    fetchDeletedTeams();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading deleted teams...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Deleted Teams</h1>
        <Button 
          onClick={() => window.history.back()}
          variant="secondary"
        >
          Back to Teams
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search deleted teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
          {search && (
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                setSearch('');
                setPage(1);
                fetchDeletedTeams();
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Deleted Teams List */}
      {deletedTeams.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No deleted teams found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {deletedTeams.map((team) => (
            <Card key={team._id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {team.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{team.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div>
                      <strong>Members:</strong> {team.members?.length || 0}
                    </div>
                    <div>
                      <strong>Projects:</strong> {team.projects?.length || 0}
                    </div>
                    <div>
                      <strong>Deleted:</strong> {new Date(team.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Button
                    onClick={() => handleRestore(team._id)}
                    disabled={restoring === team._id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {restoring === team._id ? 'Restoring...' : 'Restore'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
