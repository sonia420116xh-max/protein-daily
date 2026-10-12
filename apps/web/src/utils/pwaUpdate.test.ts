import { describe, expect, it, vi } from 'vitest'
import { createPwaUpdateController } from './pwaUpdate'

describe('PWA update controller', () => {
  it('activates and reloads when a new service worker is ready', async () => {
    const activateUpdate = vi.fn().mockResolvedValue(undefined)
    const reload = vi.fn()
    const controller = createPwaUpdateController({ activateUpdate, reload })

    await controller.applyUpdate()

    expect(activateUpdate).toHaveBeenCalledWith(false)
  })

  it('reloads only once when the new service worker takes control', () => {
    const reload = vi.fn()
    const controller = createPwaUpdateController({ activateUpdate: vi.fn(), reload })

    controller.handleControllerChange()
    controller.handleControllerChange()

    expect(reload).toHaveBeenCalledTimes(1)
  })
})
