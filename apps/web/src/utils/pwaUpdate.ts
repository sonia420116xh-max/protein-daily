interface PwaUpdateDependencies {
  activateUpdate: (reloadPage?: boolean) => Promise<void>
  reload: () => void
}

export function createPwaUpdateController({ activateUpdate, reload }: PwaUpdateDependencies) {
  let hasReloaded = false

  return {
    applyUpdate() {
      // Let controllerchange own the reload so multiple update signals cannot
      // cause a reload loop.
      return activateUpdate(false)
    },
    handleControllerChange() {
      if (hasReloaded) return
      hasReloaded = true
      reload()
    },
  }
}
