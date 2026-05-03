import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SubmissionsPage } from './SubmissionsPage'
import { submitReaderSubmission } from '../lib/queries/readerSubmissions'
import type React from 'react'

vi.mock('../lib/queries/readerSubmissions', () => ({
  submitReaderSubmission: vi.fn(async () => '12345678-1234-4234-8234-123456789abc'),
}))

vi.mock('../components/shell', () => ({
  AppShell: ({
    children,
    navigationItems,
  }: {
    children: React.ReactNode
    navigationItems: Array<{ label: string }>
  }) => (
    <div>
      <nav aria-label="test nav">
        {navigationItems.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </nav>
      {children}
    </div>
  ),
}))

vi.mock('../components/submissions/ImageUploader', () => ({
  ImageUploader: () => <div data-testid="image-uploader">[Image uploader]</div>,
}))

describe('SubmissionsPage', () => {
  it('renders anonymous submission intake fields', () => {
    render(
      <MemoryRouter initialEntries={['/kbw-notes/submissions']}>
        <SubmissionsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Submit a note.' })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByText(/cover image/i)).toBeInTheDocument()
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
    expect(screen.getByLabelText(/post body/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('submits a draft for review', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/kbw-notes/submissions']}>
        <SubmissionsPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/name/i), 'Aisha Khan')
    await user.type(screen.getByLabelText(/title/i), 'The operating cadence')
    await user.type(screen.getByLabelText(/post body/i), 'A practical note with enough detail for review.')
    await user.click(screen.getByRole('button', { name: /^submit$/i }))

    expect(submitReaderSubmission).toHaveBeenCalledWith(expect.objectContaining({
      submitterName: 'Aisha Khan',
      title: 'The operating cadence',
      coverImageUrl: '',
      content: 'A practical note with enough detail for review.',
    }))
    expect(await screen.findByText(/submission received/i)).toBeInTheDocument()
  })
})
