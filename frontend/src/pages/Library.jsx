import { useState, useEffect } from 'react';
import { useLibraryBooks, useLibraryIssues, useStudents } from '../hooks';
import { Card, CardHeader, CardContent, Button, Input, Select, Table, Th, Td, Badge, Modal, Spinner, EmptyState, Pagination } from '../components/ui';
import { Plus, Search, Edit2, Trash2, Library as LibraryIcon, BookOpen } from 'lucide-react';

export default function Library() {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Library</h1>
        <p className="text-slate-600">Manage books and issues</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'books'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'issues'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Book Issues
        </button>
      </div>

      {activeTab === 'books' ? <BooksTab /> : <IssuesTab />}
    </div>
  );
}

function BooksTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState('');

  const { books, pagination, loading, fetchBooks, createBook, updateBook, deleteBook } = useLibraryBooks();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks({ search });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Search by title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </form>
          <Button onClick={() => { setEditingBook(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : books.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={LibraryIcon}
              title="No books found"
              description="Add books to the library"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Book
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Book Code</Th>
                  <Th>Title</Th>
                  <Th>Author</Th>
                  <Th>Category</Th>
                  <Th>Available</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{book.book_code}</Td>
                    <Td>{book.title}</Td>
                    <Td>{book.author || '-'}</Td>
                    <Td>{book.category || '-'}</Td>
                    <Td>{book.available_quantity} / {book.quantity}</Td>
                    <Td>
                      <Badge variant={book.status === 'available' ? 'success' : book.status === 'issued' ? 'warning' : 'danger'}>
                        {book.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingBook(book); setShowModal(true); }} className="p-1 text-slate-400 hover:text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(book.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchBooks({ page: p })}
              />
            )}
          </>
        )}
      </Card>

      <BookModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBook(null); }}
        book={editingBook}
        onSave={async (data) => {
          const result = editingBook
            ? await updateBook(editingBook.id, data)
            : await createBook(data);
          if (result.success) {
            setShowModal(false);
            setEditingBook(null);
          }
          return result;
        }}
      />
    </>
  );
}

function IssuesTab() {
  const [showModal, setShowModal] = useState(false);

  const { issues, loading, fetchIssues, issueBook, returnBook } = useLibraryIssues();
  const { students } = useStudents();
  const { books } = useLibraryBooks();

  const handleReturn = async (issueId) => {
    if (window.confirm('Mark this book as returned?')) {
      await returnBook(issueId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Issue Book
          </Button>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : issues.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No book issues"
              description="Issue books to students"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Issue Book
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Book</Th>
                <Th>Student</Th>
                <Th>Issue Date</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50">
                  <Td>{issue.book_title || issue.book_code}</Td>
                  <Td>{issue.student_name || issue.admission_no}</Td>
                  <Td>{new Date(issue.issue_date).toLocaleDateString()}</Td>
                  <Td>{new Date(issue.due_date).toLocaleDateString()}</Td>
                  <Td>
                    <Badge variant={issue.status === 'returned' ? 'success' : issue.status === 'overdue' ? 'danger' : 'warning'}>
                      {issue.status}
                    </Badge>
                  </Td>
                  <Td>
                    {issue.status !== 'returned' && (
                      <Button size="sm" variant="secondary" onClick={() => handleReturn(issue.id)}>
                        Return
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <IssueModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        students={students}
        books={books}
        onSave={async (data) => {
          const result = await issueBook(data);
          if (result.success) {
            setShowModal(false);
          }
          return result;
        }}
      />
    </>
  );
}

function BookModal({ isOpen, onClose, book, onSave }) {
  const [formData, setFormData] = useState({
    book_code: '',
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    category: '',
    rack_no: '',
    quantity: '1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        book_code: book.book_code || '',
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        category: book.category || '',
        rack_no: book.rack_no || '',
        quantity: book.quantity?.toString() || '1',
      });
    } else {
      setFormData({
        book_code: '',
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        category: '',
        rack_no: '',
        quantity: '1',
      });
    }
  }, [book, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await onSave(formData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={book ? 'Edit Book' : 'Add Book'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Book Code *"
            name="book_code"
            value={formData.book_code}
            onChange={handleChange}
            required
          />
          <Input
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleChange}
          />
          <Input
            label="Publisher"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
          <Input
            label="Rack No"
            name="rack_no"
            value={formData.rack_no}
            onChange={handleChange}
          />
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : book ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function IssueModal({ isOpen, onClose, students, books, onSave }) {
  const [formData, setFormData] = useState({
    book_id: '',
    student_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await onSave(formData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const bookOptions = [
    { value: '', label: 'Select Book' },
    ...books.filter(b => b.available_quantity > 0).map(b => ({ value: b.id, label: `${b.book_code} - ${b.title}` }))
  ];

  const studentOptions = [
    { value: '', label: 'Select Student' },
    ...students.map(s => ({ value: s.id, label: `${s.admission_no} - ${s.full_name}` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Book">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Select
          label="Book *"
          name="book_id"
          value={formData.book_id}
          onChange={handleChange}
          options={bookOptions}
          required
        />

        <Select
          label="Student *"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          options={studentOptions}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Issue Date *"
            name="issue_date"
            type="date"
            value={formData.issue_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Due Date *"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Issuing...' : 'Issue Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
