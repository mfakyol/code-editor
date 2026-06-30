import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Explore from './index'
import { penApi, type PublicPen } from '@/config/api'
import { defaultPenSettings } from '@/types/preprocessors'

vi.mock('@/config/api', () => ({
  penApi: { publicList: vi.fn() },
}))

const makePen = (overrides: Partial<PublicPen>): PublicPen => ({
  _id: 'id1',
  title: 'Pen One',
  html: '<h1>hi</h1>',
  css: '',
  js: '',
  settings: defaultPenSettings,
  likeCount: 3,
  ownerName: 'alice',
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

const renderExplore = () =>
  render(
    <MemoryRouter>
      <Explore />
    </MemoryRouter>,
  )

const mockedList = vi.mocked(penApi.publicList)

describe('Explore page', () => {
  beforeEach(() => {
    mockedList.mockReset()
    mockedList.mockResolvedValue({ pens: [makePen({})] })
  })

  it('renders public pens with owner and like count', async () => {
    renderExplore()
    expect(await screen.findByText('Pen One')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('links each card to its full view', async () => {
    renderExplore()
    const link = await screen.findByRole('link', { name: /Pen One/ })
    expect(link).toHaveAttribute('href', '/pen/id1/full')
  })

  it('refetches with popular sort when the toggle is clicked', async () => {
    renderExplore()
    await screen.findByText('Pen One')
    expect(mockedList).toHaveBeenLastCalledWith('recent')

    await userEvent.click(screen.getByRole('button', { name: 'Popüler' }))
    await waitFor(() =>
      expect(mockedList).toHaveBeenLastCalledWith('popular'),
    )
  })

  it('shows an empty state when there are no pens', async () => {
    mockedList.mockResolvedValue({ pens: [] })
    renderExplore()
    expect(
      await screen.findByText(/Henüz herkese açık pen yok/),
    ).toBeInTheDocument()
  })
})
