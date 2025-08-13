"use client"

import * as React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterOption = {
  value: string
  label: string
}

export type FilterGroup = {
  key: string
  options: FilterOption[]
  // Optional friendly label for the UI; falls back to key if not provided
  label?: string
}

export type GroupAction = {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  destructive?: boolean
  disabled?: boolean
  onSelect?: (ctx: { selectedIds: string[]; selectedRecord: Record<string, string> }) => void
}

export type FiltersProps = {
  title: string
  filters: FilterGroup[]
  onFilterChange: (filters: Record<string, string>) => void
  // Optional: preselect some values
  initialValues?: Record<string, string>
  // Optional: show a Reset button (default true)
  showReset?: boolean
  // Optional: text for the "All" item
  allLabel?: string | ((label: string) => string)
  className?: string

  // Table selection context
  selectedIds?: string[] // when provided, group actions menu shows if any selected
  groupActions?: GroupAction[]
  onAction?: (actionKey: string, ctx: { selectedIds: string[]; selectedRecord: Record<string, string> }) => void
  actionsLabel?: string // label above actions list
}

function toTitleCase(input: string) {
  return input.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function getFilterLabel(group: FilterGroup) {
  return group.label ?? toTitleCase(group.key)
}

export function CardHeaderFilters({
  title,
  filters,
  onFilterChange,
  initialValues,
  showReset = true,
  allLabel,
  className,
  selectedIds = [],
  groupActions = [],
  onAction,
  actionsLabel = "Group actions",
}: Readonly<FiltersProps>) {
  const [selected, setSelected] = React.useState<Record<string, string>>(initialValues ? { ...initialValues } : {})

  const handleChange = React.useCallback(
    (key: string, value: string) => {
      setSelected((prev) => {
        const next = { ...prev }
        if (!value || value === "all") {
          delete next[key]
        } else {
          next[key] = value
        }
        onFilterChange?.(next)
        return next
      })
    },
    [onFilterChange],
  )

  const handleReset = React.useCallback(() => {
    setSelected({})
    onFilterChange?.({})
  }, [onFilterChange])

  const getOptionLabel = (key: string, value: string) => {
    const group = filters.find((f) => f.key === key)
    const found = group?.options.find((o) => o.value === value)
    return found?.label ?? value
  }

  const buildAllLabel = (label: string) => {
    if (typeof allLabel === "function") return allLabel(label)
    if (typeof allLabel === "string") return allLabel
    return `All ${label}`
  }

  const hasSelection = selectedIds.length > 0
  const visibleActions = (groupActions || []).filter(Boolean)

  const runAction = (action: GroupAction) => {
    const ctx = { selectedIds, selectedRecord: selected }
    if (action.onSelect) action.onSelect(ctx)
    else if (onAction) onAction(action.key, ctx)
  }

  return (
    <CardHeader className={cn("gap-3", className)}>
      {/* Top row: Title on the left, Actions on the right (only when there is a selection) */}
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-xl">{title}</CardTitle>

        {hasSelection && visibleActions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Open group actions menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <DropdownMenuItem
                      key={action.key}
                      className={cn(action.destructive && "text-destructive focus:text-destructive")}
                      disabled={action.disabled}
                      onClick={() => runAction(action)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <span className="ml-auto text-xs tracking-wider text-muted-foreground">{action.shortcut}</span>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Middle row: Filters and Reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((group) => {
            const label = getFilterLabel(group)
            const currentValue = selected[group.key] ?? "all"

            return (
              <div key={group.key} className="min-w-[160px]">
                <Label htmlFor={`filter-${group.key}`} className="sr-only">
                  {label}
                </Label>
                <Select value={currentValue} onValueChange={(val) => handleChange(group.key, val)}>
                  <SelectTrigger id={`filter-${group.key}`} className="w-[180px] sm:w-[200px]" aria-label={label}>
                    <SelectValue placeholder={label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{buildAllLabel(label)}</SelectItem>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>

        {showReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start sm:self-auto"
            onClick={handleReset}
            disabled={Object.keys(selected).length === 0}
          >
            Reset
          </Button>
        )}
      </div>

      <Separator />

      {/* Bottom row: Applied filter badges */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(selected).map(([key, value]) => {
          const label = getFilterLabel(filters.find((f) => f.key === key) || { key, options: [] })
          return (
            <Badge key={key} variant="secondary" className="text-sm">
              <span className="opacity-70 mr-1">{label}:</span> {getOptionLabel(key, value)}
            </Badge>
          )
        })}
        {Object.keys(selected).length === 0 && (
          <span className="text-sm text-muted-foreground">No filters applied</span>
        )}
      </div>
    </CardHeader>
  )
}
