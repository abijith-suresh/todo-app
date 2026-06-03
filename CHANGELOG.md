# Changelog

## [0.2.0](https://github.com/abijith-suresh/todo-app/compare/todo-app-v0.1.0...todo-app-v0.2.0) (2026-06-03)


### Features

* **app:** add detail backdrop; wire completed tasks section with view-change reset ([b15d711](https://github.com/abijith-suresh/todo-app/commit/b15d711185e69faa765e28178ea80aab80de7e8c))
* **app:** fix header checkbox alignment; split empty-state Show; project-only completed section ([6b9986a](https://github.com/abijith-suresh/todo-app/commit/6b9986a3c70dd10f6adbe1d71126b7a24e051a32))
* **app:** project completion as checkbox; showConfirm for deletes; add ConfirmModal ([ca9ae25](https://github.com/abijith-suresh/todo-app/commit/ca9ae25709127b073e1913c7da00ee5217c6d611))
* **app:** replace project header buttons with icon-only ghost actions ([a5c5fd4](https://github.com/abijith-suresh/todo-app/commit/a5c5fd44c38069221b2456af34f0068aeec2c984))
* build local-first todo app ([c0f2a5d](https://github.com/abijith-suresh/todo-app/commit/c0f2a5db9e9d3c3c23bd65b1fdc41a1eb6fdbba4))
* **completed-section:** inline divider header; ghost rows with undo icon; exit animation ([9cca1e0](https://github.com/abijith-suresh/todo-app/commit/9cca1e0ff2239486477b87494480ff2c06cb4ed5))
* **confirm-modal:** new custom confirmation modal replacing window.confirm ([2238d7a](https://github.com/abijith-suresh/todo-app/commit/2238d7ac2b543f3c8c8b9ce1dc6f55bcd006b682))
* **css:** add backdrop, metadata rows, date picker, and completed section styles; update plan ([b91e8b7](https://github.com/abijith-suresh/todo-app/commit/b91e8b790ff97cdfbe6a7352ea78176e6fcb89ec))
* **css:** add task-row separator, quickadd icon button, and detail panel styles ([032274c](https://github.com/abijith-suresh/todo-app/commit/032274cb60dbe7a57a85f259fee0b31cb030a1d0))
* **css:** bolder checkbox; inline completed header; empty-state animation ([e521a19](https://github.com/abijith-suresh/todo-app/commit/e521a19d378f7bfa12546408975b72bde53292ee))
* **css:** revise dark mode tokens; add confirm modal and project dropdown styles ([5a8ff7b](https://github.com/abijith-suresh/todo-app/commit/5a8ff7b2e5eac2127b7d0a91a1368a7489658465))
* **date-picker,completed-section:** add custom calendar modal and collapsible completed tasks list ([9df5af1](https://github.com/abijith-suresh/todo-app/commit/9df5af1bfcdf712868221ac131a549403eae0bd7))
* **detail-panel:** document-editor UX with inline completion circle and icon date pickers ([e20041c](https://github.com/abijith-suresh/todo-app/commit/e20041c81c2d43d5fe218b1b014c6a802f9cd76b))
* **detail-panel:** metadata card layout; custom project dropdown; showConfirm for delete ([668a13e](https://github.com/abijith-suresh/todo-app/commit/668a13e635e2e5fa066483eeffdb8c1d2fb4be8a))
* **detail-panel:** metadata rows layout; custom date picker wiring; project dropdown ([d7ea48f](https://github.com/abijith-suresh/todo-app/commit/d7ea48f13a1d3239e8a97826421bdcb739d0de84))
* **icons:** add ChevronDownIcon; add style prop to IconProps interface ([8db9190](https://github.com/abijith-suresh/todo-app/commit/8db9190cae2ff6316e26bb461f0ed3079e3f3686))
* **icons:** add ChevronLeft, ChevronRight, and CalendarCheck2 navigation icons ([82474bc](https://github.com/abijith-suresh/todo-app/commit/82474bc0a4a6abcf2bf479d97cdf5be2167537c9))
* **icons:** add Undo2Icon (RotateCcw) for completed task reopen affordance ([1883da9](https://github.com/abijith-suresh/todo-app/commit/1883da92ff38ea7e5a09848955a1028e915aab43))
* **marketing:** redesign landing and marketing pages ([#35](https://github.com/abijith-suresh/todo-app/issues/35)) ([cab15b7](https://github.com/abijith-suresh/todo-app/commit/cab15b72aff13a84b7579b9304ff6690afb77af7))
* migrate site to astro with solid app island ([#23](https://github.com/abijith-suresh/todo-app/issues/23)) ([23eb95f](https://github.com/abijith-suresh/todo-app/commit/23eb95f1d1471d3b9c5d4ab9c204419f2040e907))
* **quick-add:** replace native date inputs with custom DatePickerModal ([da956c1](https://github.com/abijith-suresh/todo-app/commit/da956c1faa98e92d91707483f54f113d19b81e66))
* **settings:** redesign with spacing-based hierarchy; remove boxy borders and uppercase labels ([222326e](https://github.com/abijith-suresh/todo-app/commit/222326e4100115261da11dc71a910cd92981bee7))
* **settings:** use showConfirm for import confirmation instead of window.confirm ([16679c2](https://github.com/abijith-suresh/todo-app/commit/16679c270f68466611beaf23a6ca834d54d1734c))
* **store:** add completedViewTasks and reopenTask; roll over stale whenDates on load ([86dbe4e](https://github.com/abijith-suresh/todo-app/commit/86dbe4ec59c36d047b7e0df6b182f04c2a2dfa76))
* **store:** cancelComplete for instant undo; restrict completedViewTasks to project view ([a2f3055](https://github.com/abijith-suresh/todo-app/commit/a2f30550c902dd5525cd1d72ee6fc84d8eb93160))
* **store:** whenDate rollover on load; confirm dialog state; remove window.confirm from importData ([861871c](https://github.com/abijith-suresh/todo-app/commit/861871c814fca682040d4bde568a8977f437685e))
* strip down to quick-capture tool matching product spec ([#39](https://github.com/abijith-suresh/todo-app/issues/39)) ([2c484ad](https://github.com/abijith-suresh/todo-app/commit/2c484adbcdca1ba1fbcdef659ceca2e0785a477c))
* **task-list:** open canvas layout — remove borders, arrows, drag handles; add DragOverlay ([004f67d](https://github.com/abijith-suresh/todo-app/commit/004f67dacc6fb4e198e85ffb035e6e7797699539))
* **task-row,detail-panel:** checkbox shows completing state; toggle cancel/complete on click ([509ebf6](https://github.com/abijith-suresh/todo-app/commit/509ebf6df7f607be31263f18db1aa4d81425fb89))
* **task-row:** icon-only due indicator; remove row urgency backgrounds and date text chips ([585c5a3](https://github.com/abijith-suresh/todo-app/commit/585c5a36ac6d57713e8fe6155dc99cc91d4ecba7))
* **ui:** redesign UI; add command palette, quick add, detail panel ([c7979b4](https://github.com/abijith-suresh/todo-app/commit/c7979b4679c599c6f54c0be20be74abf5866ba20))


### Bug Fixes

* **app:** enlarge project completion checkbox to match 2xl heading scale ([221099a](https://github.com/abijith-suresh/todo-app/commit/221099aa81eba63e0b4cc2aa6f8e4ef9c94ba2d8))
* **date-picker:** add position:relative z-index:1 to card so it sits above the backdrop ([e6c6f4f](https://github.com/abijith-suresh/todo-app/commit/e6c6f4fe660309533be040ae8c4163dcad9a132f))
* **detail-panel:** use keyed Show for fresh task data; move date inputs outside scroll container ([874b4fe](https://github.com/abijith-suresh/todo-app/commit/874b4fe707d334f1b8360d749deecef2b2d6e645))
* **quick-add:** icon-only date buttons; collapse form on focus-out ([bb3d530](https://github.com/abijith-suresh/todo-app/commit/bb3d5303a6d550f4ef3a98e2f3f5b8861aa3af55))
* **sidebar:** fix double project creation; remove project drag handle ([d307bbf](https://github.com/abijith-suresh/todo-app/commit/d307bbf0ecd09572fac9517222974544edc9d5c1))
