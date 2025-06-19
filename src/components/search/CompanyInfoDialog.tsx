"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Building2, User, MapPin, Phone, ExternalLink, Search, AlertCircle } from "lucide-react"

interface CompanyInfo {
  number: string
  companyName: string
  representative: string
  address: string
  phone: string
  linkIdx?: string
}

interface CompanyInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
}

export default function CompanyInfoDialog({ isOpen, onClose, companyName }: CompanyInfoDialogProps) {
  const [companies, setCompanies] = useState<CompanyInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanyInfo = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/company-info?name=${encodeURIComponent(companyName)}`)
      const data = await response.json()

      if (data.success) {
        setCompanies(data.companies)
      } else {
        setError(data.error || "업체 정보를 찾을 수 없습니다.")
      }
    } catch {
      setError("업체 정보를 가져오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [companyName])

  useEffect(() => {
    if (isOpen && companyName) {
      fetchCompanyInfo()
    }
  }, [isOpen, companyName, fetchCompanyInfo])

  const handleClose = () => {
    setCompanies([])
    setError(null)
    onClose()
  }

  // KATIA 사이트 URL 생성 (link_idx 사용)
  const getKatiaUrl = (company: CompanyInfo) => {
    if (company.linkIdx) {
      // link_idx가 있으면 상세 페이지로 연결
      return `https://www.katia.or.kr/work/member_manage.php?search_order=&mode=v&premode=&code=member_manage&category=&idx=${company.linkIdx}&fk_idx=&thisPageNum=1&Dosearch=`
    } else {
      // link_idx가 없으면 검색 페이지로 연결
      const encodedCompanyName = encodeURIComponent(company.companyName)
      return `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodedCompanyName}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
                평가대행업체 정보
              </span>
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">검색어:</span>
            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
              {companyName}
            </Badge>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-slate-700 dark:text-slate-300">업체 정보를 검색하고 있습니다</p>
                <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
              </div>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/50 dark:to-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="font-medium text-red-800 dark:text-red-200">검색 결과를 찾을 수 없습니다</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(companyName)}`, '_blank')}
                      className="cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      KATIA 공식 사이트에서 확인
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && companies.length === 0 && (
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      해당 업체의 정보를 찾을 수 없습니다
                    </p>
                    <p className="text-sm text-muted-foreground">KATIA 공식 사이트에서 직접 확인해보세요</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() =>
                      window.open(
                        `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(companyName)}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    KATIA 사이트 방문
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && companies.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  {companies.length}개 업체 발견
                </Badge>
              </div>

              <div className="space-y-4">
                {companies.map((company, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                              {company.companyName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                등록번호: {company.number}
                              </span>
                              {company.linkIdx && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                  Link ID: {company.linkIdx}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-700/30">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">대표자</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {company.representative || "정보 없음"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-700/30">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">연락처</p>
                              <p className="text-sm text-muted-foreground mt-1">{company.phone || "정보 없음"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-700/30">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                            <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">주소</p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {company.address || "정보 없음"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-700 dark:text-slate-300">더 자세한 정보가 필요하신가요?</p>
                    <p className="text-sm text-muted-foreground">
                      KATIA 공식 사이트에서 추가 정보를 확인하실 수 있습니다
                    </p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      // 첫 번째 회사의 link_idx를 사용하거나, 없으면 검색 페이지로
                      const firstCompany = companies[0]
                      window.open(getKatiaUrl(firstCompany), "_blank")
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    KATIA 사이트 방문
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
